import React, { useState, useEffect } from "react";
import { Marker, GoogleApiWrapper, Map } from "google-maps-react";

//note that google inside the below prop is coming from GoogleApiWrapper.
function RentalsMap({ locations, google, setHighLight }) {
  const [center, setCenter] = useState();
  useEffect(() => {
    if (locations) {
      //Object.Keys takes object as parameter and return array.
      let arr = Object.keys(locations);

      if (arr.length > 0) {
        let getLat = (key) => locations[key]["lat"];
        let avgLat =
          arr.reduce((a, c) => a + Number(getLat(c), 0)) / arr.length;

        let getLng = (key) => locations[key]["lng"];
        let avgLng =
          arr.reduce((a, c) => a + Number(getLng(c)), 0) / arr.length;

        setCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [locations]);

  return (
    <>
      {center && (
        <Map
          google={google}
          containerStyle={{
            width: "50vw",
            height: "calc(100vh - 135px)",
          }}
          center={center}
          initialCenter={locations[0]}
          zoom={13}
          disableDefaultUI={true}
        >
          {locations.map((coords, i) => (
            <Marker position={coords} onClick={() => setHighLight(i)} />
          ))}
        </Map>
      )}
    </>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_gmapApi,
})(RentalsMap);
