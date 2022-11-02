import React from "react";
import { Modal, Card } from "@web3uikit/core";
import { User } from "@web3uikit/icons";
import { useState, useEffect } from "react";

import { useMoralis } from "react-moralis";

function UserBookings({ account }) {
  const [isVisible, setVisible] = useState(false);
  const { Moralis } = useMoralis();
  const [userRentals, setUserRentals] = useState();

  useEffect(() => {
    async function fetchRentals() {
      const Rentals = Moralis.Object.extend("newBookings");
      const query = new Moralis.Query(Rentals);
      query.equalTo("booker", account);
      const result = await query.find();

      setUserRentals(result);
    }

    fetchRentals();
  }, [isVisible]);

  return (
    <>
      <div onClick={() => setVisible(true)}>
        <User fill="#000000" fontSize={24} />
      </div>

      <Modal
        onCloseButtonPressed={() => setVisible(false)}
        hasFooter={false}
        title="Your Stays"
        isVisible={isVisible}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {userRentals &&
            userRentals.map((e, i) => (
              <div key={i} style={{ width: "200px" }}>
                <Card
                  isDisabled
                  title={e.attributes.city}
                  description={`${e.attributes.datesBooked[0]} for ${e.attributes.datesBooked.length} Days`}
                >
                  <div>
                    <img width="180px" src={e.attributes.imgUrl} />
                  </div>
                </Card>
              </div>
            ))}
        </div>
      </Modal>
    </>
  );
}

export default UserBookings;
