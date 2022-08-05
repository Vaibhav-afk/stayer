// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract stayer{
    address public owner;
    //we will increment this counter every time we get new rental
    uint256 private counter;

    constructor(){
        counter = 0;
        //msg.sender indicates the sender of current message
        owner = msg.sender;
    }

    //structure of rentalInfo this contain all details of every rental we put on smart contract.
    struct rentalInfo{
        string name;
        string city;
        string lat;
        string long;
        string unoDescription;
        string dosDescription;
        string imgUrl;
        uint256 maxGuests;
        uint256 pricePerDay;
        string[] datesBooked;
        uint256 id;
        address renter;
    }

    /*
    Every time new rental is created on a smart contract.
    We should emit an event with all the details passed as parameters.
    */
    event rentalCreated(
        string name,
        string city,
        string lat,
        string long,
        string unoDescription,
        string dosDescription,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        string[] datesBooked,
        uint256 id,
        address renter
    );

    event newDatesBooked(
        string[] datesBooked,
        uint256 id,
        address booker,
        string city,
        string imgUrl
    );

    //mapping in which every number consist of a rental info struct we call this mapping rentals.
    mapping(uint256 => rentalInfo) rentals;
    //we will store each rental inside the rentalIds array.
    uint256[] public rentalIds;

    function addRentals(        
        string memory name,
        string memory city,
        string memory lat,
        string memory long,
        string memory unoDescription,
        string memory dosDescription,
        string memory imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        string[] memory datesBooked
    )public{
        require(msg.sender == owner,"Only owner of smart contract has permission to add rentals");
        rentalInfo storage newRental = rentals[counter];
        newRental.name = name;
        newRental.city = city;
        newRental.lat = lat;
        newRental.long = long;
        newRental.unoDescription = unoDescription;
        newRental.dosDescription = dosDescription;
        newRental.imgUrl = imgUrl;
        newRental.maxGuests = maxGuests;
        newRental.pricePerDay = pricePerDay;
        newRental.datesBooked = datesBooked;
        newRental.id = counter;
        newRental.renter = owner;
        //we will push id of rental in rentalIds array to keep track of how many rentals present.
        rentalIds.push(counter);
        //by emiting data present in our smart contract for the structure storage we create for each rental
        //we will be able to recieve it on moralis and use it for our react app.
        emit rentalCreated(name,
        city,
        lat,
        long,
        unoDescription,
        dosDescription,
        imgUrl,
        maxGuests,
        pricePerDay,
        datesBooked,
        counter,
        owner
        );
        counter++;
    }
    
    //check whether the rental has already been booked for the given date
    function checkBookings(uint256 id,string[] memory newBookings) private view returns (bool){
        for(uint i=0; i<newBookings.length; ++i){
            for(uint j=0; j<rentals[id].datesBooked.length; ++j){
                //because in solidity we can't compare between strings
                //we should hash it before comparing so we will hash using 
                //keccak256 which is a cryptographic function built into solidity
                //we are comparing new bookings with the existing bookings to check if it is
                //possible to book new booking on a given date.
                if(keccak256(abi.encodePacked(rentals[id].datesBooked[j]))== keccak256(abi.encodePacked(abi.encodePacked(newBookings[i])))){
                    return false;
                }
            }
        }        
        return true;
    }

    //newBookings parameter passed in addDatesBooked function is an array of dates
    //newBookings.length will give us no. of days person is staying.
    function addDatesBooked(uint256 id,string[] memory newBookings) public payable{
        //id must be lesser than counter to ensure rental existence.
        //because each time new rental is added we increment counter and store in
        //rentals array as id to access each retal.
        require(id < counter,"No such Rental");
        //we are checking the newBookings array against the already existing bookings
        //using checkBooking functions.
        require(checkBookings(id,newBookings),"Already booked for requested date.");
        //msg.value is matic or ethereum value that we will send while calling addDatesBooked function.
        //1 ether is multiplied by pricePerDay to convert value into decimal because 
        //msg.value will be in decimal and to make comparision we must convert the corresponding value.
        require(msg.value == (rentals[id].pricePerDay*1 ether * newBookings.length),"Please submit the asking price in order to complete the purchase.");

        //Pushing newBookings into the id of specific rental datesBooked array to store
        //the number of bookings on the blockchain on the smart contract.
        for(uint i=0; i<newBookings.length; ++i){
            rentals[id].datesBooked.push(newBookings[i]);
        }

        //to make sure owner of smart contract must gets the msg.value that is sent along side
        //the addDatesBooked function so they get crypto in return for other address booking the rental.
        payable(owner).transfer(msg.value);

        //emitting newDatesBooked events so that moralis can listen whenever this function gets completed
        //on the blockchain, moralis can get the details of this new booking then we can use that in our 
        //frontend.
        emit newDatesBooked(newBookings,id,msg.sender,rentals[id].city,rentals[id].imgUrl);
    } 

    //function to get the rental we provide an id of a rental we want to search for and it will
    //return name of rental, pricePerDay, datesBooked.
    function getRental(uint256 id) public view returns(string memory,uint256,string[] memory){
        require(id<counter,"No such rental");
        rentalInfo storage s = rentals[id];
        return (s.name,s.pricePerDay,s.datesBooked);
    }
}
