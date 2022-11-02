import React, { useState, useEffect } from "react";
import "./Rentals.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/stayerColored.png";
import { ConnectButton } from "@web3uikit/web3";
import { Search, Eth } from "@web3uikit/icons";
import { Button, useNotification } from "@web3uikit/core";

import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import RentalsMap from "../components/RentalsMap";
import UserBookings from "../components/UserBookings";

const Rentals = () => {
  const { state: searchFilters } = useLocation();

  const [highLight, setHighLight] = useState(-1);
  const { Moralis, account } = useMoralis();
  const [rentalsList, setRentalsList] = useState();
  const [coOrdinates, setCoOrdinates] = useState();

  const contractProcessor = useWeb3ExecuteFunction();
  const dispatch = useNotification();

  const handleSuccess = () => {
    dispatch({
      type: "success",
      message: `Nice! You are going to ${searchFilters.destination}!!`,
      title: "Booking Succesful",
      position: "topL",
    });
  };

  const handleError = (msg) => {
    dispatch({
      type: "error",
      message: `${msg}`,
      title: "Booking Failed",
      position: "topL",
    });
  };

  const handleNoAccount = () => {
    dispatch({
      type: "error",
      message: "You need to connect your wallet to book a rental.",
      title: "Not Connected",
      position: "topL",
    });
  };

  useEffect(() => {
    async function fetchRentalsList() {
      const Rentals = Moralis.Object.extend("Rentals");
      const query = new Moralis.Query(Rentals);
      query.equalTo("city", searchFilters.destination);
      query.greaterThanOrEqualTo("maxGuests_decimal", searchFilters.guests);

      const result = await query.find();

      let cords = [];
      result.forEach((e) => {
        cords.push({ lat: e.attributes.lat, lng: e.attributes.long });
      });

      setCoOrdinates(cords);
      setRentalsList(result);
    }

    fetchRentalsList();
  }, [searchFilters]);

  const bookRental = async function (start, end, id, dayPrice) {
    let arr = [],
      dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt).toISOString().slice(0, 10)); //yyyy-mm-dd format
      dt.setDate(dt.getDate() + 1);
    }
    let options = {
      contractAddress: "0x92baacC9f84637Ffb2c68E92903c3D6c9F3B0Cf3",
      functionName: "addDatesBooked",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string[]",
              name: "newBookings",
              type: "string[]",
            },
          ],
          name: "addDatesBooked",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {
        id: id,
        newBookings: arr,
      },
      msgValue: Moralis.Units.ETH(dayPrice * arr.length),
    };
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handleSuccess();
      },
      onError: (err) => {
        handleError(err.data.message);
      },
    });
  };

  return (
    <>
      <div className="topBanner">
        <div>
          <Link to="/">
            <img className="logo" src={logo} alt="logo"></img>
          </Link>
        </div>

        <div className="searchReminder">
          <div className="filter">{searchFilters.destination}</div>
          <div className="vl" />
          <div className="filter">
            {`${searchFilters.checkIn.toLocaleString("default", {
              month: "short",
            })}
            ${searchFilters.checkIn.toLocaleString("default", {
              day: "2-digit",
            })}
            -
            ${searchFilters.checkOut.toLocaleString("default", {
              month: "short",
            })}
            ${searchFilters.checkOut.toLocaleString("default", {
              day: "2-digit",
            })}
            `}
          </div>
          <div className="vl" />
          <div className="filter">{searchFilters.guests} Guest</div>

          <div className="searchButton">
            <Search fill="#fff" size={20} />
          </div>
        </div>

        <div className="lrContainers">
          {account && <UserBookings account={account} />}
          <ConnectButton />
        </div>
      </div>
      <hr className="line" />
      <div className="rentalsContent">
        <div className="rentalsContentL">
          {rentalsList && rentalsList.length > 0
            ? "Stays Available For Your Destination"
            : "No Stays Available For This Destination Right Now"}
          {rentalsList &&
            rentalsList.map((e, i) => {
              return (
                <div key={i}>
                  <hr className="line2" />

                  <div className={highLight == i ? "rentalDivH" : "rentalDiv"}>
                    <img className="rentalImg" src={e.attributes.imgUrl}></img>

                    <div className="rentalInfo">
                      <div className="rentalTitle">{e.attributes.name}</div>

                      <div className="rentalDesc">
                        {e.attributes.unoDescription}
                      </div>

                      <div className="rentalDesc">
                        {e.attributes.dosDescription}
                      </div>

                      <div className="bottomButton">
                        <Button
                          onClick={() => {
                            if (account) {
                              bookRental(
                                searchFilters.checkIn,
                                searchFilters.checkOut,
                                e.attributes.uid_decimal.value.$numberDecimal,
                                Number(
                                  e.attributes.pricePerDay_decimal.value
                                    .$numberDecimal
                                )
                              );
                            } else {
                              handleNoAccount();
                            }
                          }}
                          text="Stay Here"
                          theme="secondary"
                        />
                      </div>

                      <div className="price">
                        <Eth fill="#808080" size={30} />
                        {e.attributes.pricePerDay}/Day
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="rentalsContentR">
          <RentalsMap locations={coOrdinates} setHighLight={setHighLight} />
        </div>
      </div>
    </>
  );
};

export default Rentals;
