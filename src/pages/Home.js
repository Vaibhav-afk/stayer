import React, { useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

import bg from "../images/frontpagebg.png";
import logo from "../images/stayer.png";
import { ConnectButton } from "@web3uikit/web3";
import { Select, DatePicker, Input, Button } from "@web3uikit/core";
import { Search } from "@web3uikit/icons";

const Home = () => {
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState(1);

  return (
    <>
      <div className="container" style={{ backgroundImage: `url(${bg})` }}>
        <div className="containerGradinet"></div>
      </div>

      <div className="topBanner">
        <div>
          <img className="logo" src={logo} alt="logo"></img>
        </div>

        <div className="tabs">
          <div className="selected">Places To Stay</div>
          <div>Experiences</div>
          <div>Online Experiences</div>
        </div>

        <div className="lrContainers">
          <ConnectButton />
        </div>
      </div>

      <div className="tabContent">
        <div className="searchFields">
          <div className="inputs">
            <p className="inputName">Location</p>
            <Select
              defaultOptionIndex={0}
              id="Select"
              onChange={(data) =>  setDestination(data.label)}
              options={[
                { id: "ny", label: "New York" },
                { id: "lon", label: "London" },
                { id: "db", label: "Dubai" },
                { id: "la", label: "Los Angeles" },
              ]}
              // traditionalHTML5
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            <p className="inputName">Check In</p>
            <DatePicker
              id="CheckIn"
              onChange={(event) => setCheckIn(event.date)}
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            <p className="inputName">Check Out</p>
            <DatePicker
              id="CheckOut"
              onChange={(event) => setCheckOut(event.date)}
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            <p className="inputName">Guests</p>
            <Input
              value={2}
              name="AddGuests"
              type="number"
              onChange={(event) => setGuests(Number(event.target.value))}
            />
          </div>

          <Link
            to={"/rentals"}
            state={{ destination, checkIn, checkOut, guests }}
          >
            <div className="searchButton">
              <Search fill="#fff" style={{ borderRadius: "50%" }} size={24} />
            </div>
          </Link>
        </div>
      </div>

      <div className="randomLocation">
        <div className="title">Feel Adventurous</div>
        <div className="text">
          Let us decide and discover new places to stay, live, work or just
          relax.
        </div>
        <Button
          text="Explore A Location"
          theme="secondary"
          size="large"
          onClick={() => alert("Explore a location")}
        />
      </div>
    </>
  );
};

export default Home;
