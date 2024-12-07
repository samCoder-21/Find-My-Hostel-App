
function changeStyle(element, color) {
 element.style.borderColor = color;
 const icon = element.querySelector("i");
 if (icon) icon.style.color = color;
}

function displayUsername() {
   const userData = localStorage.getItem('username');
   if (userData) {
     const { username, status } = JSON.parse(userData);

     if (status === "loggedIn") {
       const usernameElement = document.getElementById("username");
       const textContent = `Welcome, ${username}!`;

       usernameElement.textContent = textContent;

       // Calculate text length and steps dynamically
       const textLength = textContent.length; // Number of characters
       const stepCount = textLength; // Equal to character count

       // Set custom properties for CSS
       usernameElement.style.setProperty("--text-length", `${textLength}ch`);
       usernameElement.style.setProperty("--step-count", stepCount);

     } else {
       alert("You are logged out. Please log in.");
       window.location.href = "./login.html";
     }
   } else {
     alert("No user data found. Redirecting to registration page.");
     window.location.href = "./registerpage.html";
   }
 }

const priceRange = document.getElementById('priceRange');
const rangeValue = document.getElementById('rangeValue');

// Update the value dynamically when the range input changes
priceRange.addEventListener('input', function () {
  rangeValue.textContent = `RS. ${priceRange.value}`;
});

function handleLogout() {
   const userData = localStorage.getItem('username');
   if (userData) {
     const userDetails = JSON.parse(userData);
     userDetails.status = "loggedOut"; // Update status to loggedOut
     localStorage.setItem('username', JSON.stringify(userDetails));
   }

   alert("You have successfully logged out!");
   window.location.href = "../index.html";
 }

async function fetchAddress() {
 const apiKey = "62d17ed588174e02aab78e7be7fb531c"; // Replace with your OpenCage API key
 const addressDiv = document.getElementById('addressValue');

 if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // console.log("Latitude:", latitude, "Longitude:", longitude);

      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

      try {
       const response = await fetch(url);

       if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
       }

       const data = await response.json();
       // console.log("API Response Data:", data);

       // Extract formatted addresses
       const results = data.results.map(result => result.formatted);
       // console.log("All Results:", results);

       if (results.length > 0) {
        let address = results[0];

        // Step 1: Remove "unnamed road" if present
        if (address.toLowerCase().includes("unnamed road")) {
         address = address.replace(/unnamed road,\s*/i, "");
         // console.log("Processed Address (without 'unnamed road'):", address);
        }

        // Step 2: Remove duplicate city names
        const components = data.results[0].components; // Extract components from API
        const city = components.city || components.town || components.village;

        if (city && address.includes(city)) {
          const cityPattern = new RegExp(`(\\b${city}\\b,?\\s*){2,}`, "gi");
          address = address.replace(cityPattern, `${city}, `);
        }

        // console.log("Final Address:", address);
        addressDiv.innerHTML = '<i class="fa-solid fa-location-dot fa-xl"></i>' + address
       } else {
       console.log("No valid address found. Nothing to display.");
      }
     } catch (error) {
      console.error("Error fetching address:", error);
     }
    }, (error) => {
     console.error("Geolocation error:", error);
    });
 } else {
  console.error("Geolocation is not supported by this browser.");
 }
}

fetchAddress();

// Function to fetch and populate cities
async function fetchCities() {
   const filteredCities = new Set(); // Unique cities
   try {
     // Fetching data from JSON file
     const res = await fetch('../data/data.json');
     const data = await res.json();

     // Add each city to the Set
     data.forEach(item => {
       if (item.city) {
         filteredCities.add(item.city);
       }
     });

     // Clear existing options in the select tag
     const dropdown = document.getElementById('cityList');
     dropdown.innerHTML = '<option value="">Select a City</option>'; // Reset with default option

     // Populate unique city options
     filteredCities.forEach(city => {
       const option = document.createElement('option');
       option.value = city;
       option.textContent = city;
       dropdown.appendChild(option);
     });

   } catch (error) {
     console.error('Error fetching cities:', error);
   }
 }

// Call the function
fetchCities();

async function initializeFilters() {
 try {
   const response = await fetch('../data/data.json'); // Adjust the path if necessary
   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

   const data = await response.json();

   // Get the minimum and maximum prices from the JSON
   const prices = data.map(item => item.price_per_month);
   const minPrice = Math.min(...prices);
   const maxPrice = Math.max(...prices);

   // Populate city dropdown
   const cities = Array.from(new Set(data.map(item => item.city))); // Unique cities
   const cityDropdown = document.getElementById('cityList');
   cityDropdown.innerHTML = '<option value="">All Cities</option>'; // Default option
   cities.forEach(city => {
     const option = document.createElement('option');
     option.value = city;
     option.textContent = city;
     cityDropdown.appendChild(option);
   });

   // Initialize the price range input
   const priceRange = document.getElementById('priceRange');
   const rangeValue = document.getElementById('rangeValue');
   priceRange.min = minPrice;
   priceRange.max = maxPrice;
   priceRange.value = maxPrice; // Default to max price
   rangeValue.textContent = `RS. ${priceRange.value}`;

   // Update displayed price dynamically
   priceRange.addEventListener('input', function () {
     rangeValue.textContent = `RS. ${priceRange.value}`;
     filterHostels(data);
   });

   // Add event listeners for the search and city dropdown
   document.getElementById('searchValue').addEventListener('input', function () {
     filterHostels(data);
   });

   document.getElementById('cityList').addEventListener('change', function () {
     filterHostels(data);
   });

   // Render initial results
   renderResults(data);
 } catch (error) {
   console.error('Error initializing filters:', error);
 }
}

function filterHostels(data) {
 // Get filter values
 const searchValue = document.getElementById('searchValue').value.toLowerCase();
 const selectedCity = document.getElementById('cityList').value;
 const maxPrice = parseInt(document.getElementById('priceRange').value, 10);

 // Filter the data
 const filteredData = data.filter(item => {
   const matchesName = item.name.toLowerCase().includes(searchValue);
   const matchesCity = !selectedCity || item.city === selectedCity;
   const matchesPrice = item.price_per_month <= maxPrice;

   return matchesName && matchesCity && matchesPrice;
 });

 // Render the filtered results
 renderResults(filteredData);
}

function renderResults(data) {
 const resultsContainer = document.getElementById('resultsContainer');
 resultsContainer.innerHTML = ''; // Clear existing content

 if (data && data.length > 0) {
  data.forEach(item => {
   const resultItem = document.createElement('div');
   resultItem.classList.add('result-item');
   resultItem.addEventListener('click' , ()=>{
    showCheckout(item)
   })

   const namePrice = document.createElement('div');
   namePrice.classList.add('name-price');

   const hostel_name = document.createElement('div');
   hostel_name.classList.add('hostel-name');
   hostel_name.textContent = item.name;

   const hostel_address = document.createElement('small');
   hostel_address.classList.add('hostel-address');
   hostel_address.textContent = item.address;

   const name = document.createElement('div');
   name.classList.add('name');
   name.appendChild(hostel_name);
   name.appendChild(hostel_address);

   const price = document.createElement('div');
   price.classList.add('price');
   price.textContent = `₹${item.price_per_month}/month`;

   namePrice.appendChild(name);
   namePrice.appendChild(price);

   const mainImage = document.createElement('div');
   mainImage.classList.add('mainImage');
   mainImage.style.backgroundImage = `url(${item.main_image})`;
   mainImage.style.backgroundSize = 'cover';
   mainImage.style.backgroundPosition = 'center';
   mainImage.style.height = '150px';
   mainImage.style.borderRadius = '8px';

            // Create the ratings-gender section
      const ratingsGender = document.createElement('div');
      ratingsGender.classList.add('ratings-gender');

      const ratings = document.createElement('div');
      ratings.classList.add('ratings');

      // Generate star ratings
      const starContainer = document.createElement('div');
      starContainer.classList.add('star-container');
      const maxStars = 5;
      const fullStars = Math.floor(item.rating); // Full stars
      const halfStar = item.rating % 1 >= 0.5; // Check for half star

      for (let i = 0; i < maxStars; i++) {
        const star = document.createElement('i');
        if (i < fullStars) {
          star.classList.add('fas', 'fa-star'); // Full star
        } else if (i === fullStars && halfStar) {
          star.classList.add('fas', 'fa-star-half-alt'); // Half star
        } else {
          star.classList.add('far', 'fa-star'); // Empty star
        }
        starContainer.appendChild(star);
      }

      const ratingText = document.createElement('div');
      ratingText.textContent = `${item.rating} / 5`;

      ratings.appendChild(starContainer);
      ratings.appendChild(ratingText);

      const gender = document.createElement('div');
      gender.classList.add('gender');

      if (item.gender === 'Both') {
        gender.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person-dress"></i>';
      } else if (item.gender === 'Boys') {
        gender.innerHTML = '<i class="fa-solid fa-person"></i>';
      } else if (item.gender === 'Girls') {
        gender.innerHTML = '<i class="fa-solid fa-person-dress"></i>';
      }

      ratingsGender.appendChild(ratings);
      ratingsGender.appendChild(gender);

   const description = document.createElement('div');
   description.classList.add('description');
   description.textContent = item.description;

   resultItem.appendChild(namePrice);
   resultItem.appendChild(mainImage);
   resultItem.appendChild(ratingsGender);
   resultItem.appendChild(description);
   resultsContainer.appendChild(resultItem);
  });
 } else {
  resultsContainer.innerHTML = '<center style="color:white;">No results found.</center>';
 }
}

// Call initialization function
initializeFilters();

// Function to fetch data from data.json and display it in the results container
async function fetchData() {
 try {
  console.log('Fetching data...');
  const response = await fetch('../data/data.json'); // Adjust path if needed
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

  const data = await response.json();
  // console.log('Data fetched:', data);

  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = ''; // Clear existing content

  if (data && data.length > 0) {
    data.forEach(item => {
      // Create the result-item container
      const resultItem = document.createElement('div');
      resultItem.classList.add('result-item');
      resultItem.addEventListener('click' , ()=>{
       showCheckout(item)
      })

      // Create the name-price section
      const namePrice = document.createElement('div');
      namePrice.classList.add('name-price');

      const hostel_name = document.createElement('div');
      hostel_name.classList.add('hostel-name');
      hostel_name.textContent = item.name;

      const hostel_address = document.createElement('small');
      hostel_address.classList.add('hostel-address');
      hostel_address.innerHTML = '<i class="fa-solid fa-location-dot fa-xl"></i>' + ' ' + item.address;

      const name = document.createElement('div');
      name.classList.add('name');
      name.appendChild(hostel_name);
      name.appendChild(hostel_address);

      const price = document.createElement('div');
      price.classList.add('price');
      price.textContent = `₹${item.price_per_month}/month`;

      namePrice.appendChild(name);
      namePrice.appendChild(price);

      // Create the main image section
      const mainImage = document.createElement('div');
      mainImage.classList.add('mainImage');
      mainImage.style.backgroundImage = `url(${item.main_image})`;
      mainImage.style.backgroundSize = 'cover';
      mainImage.style.backgroundPosition = 'center';
      mainImage.style.height = '150px';
      mainImage.style.borderRadius = '8px';

      // Create the ratings-gender section
      const ratingsGender = document.createElement('div');
      ratingsGender.classList.add('ratings-gender');

      const ratings = document.createElement('div');
      ratings.classList.add('ratings');

      // Generate star ratings
      const starContainer = document.createElement('div');
      starContainer.classList.add('star-container');
      const maxStars = 5;
      const fullStars = Math.floor(item.rating); // Full stars
      const halfStar = item.rating % 1 >= 0.5; // Check for half star

      for (let i = 0; i < maxStars; i++) {
        const star = document.createElement('i');
        if (i < fullStars) {
          star.classList.add('fas', 'fa-star'); // Full star
        } else if (i === fullStars && halfStar) {
          star.classList.add('fas', 'fa-star-half-alt'); // Half star
        } else {
          star.classList.add('far', 'fa-star'); // Empty star
        }
        starContainer.appendChild(star);
      }

      const ratingText = document.createElement('div');
      ratingText.textContent = `${item.rating} / 5`;

      ratings.appendChild(starContainer);
      ratings.appendChild(ratingText);

      const gender = document.createElement('div');
      gender.classList.add('gender');

      if (item.gender === 'Both') {
        gender.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person-dress"></i>';
      } else if (item.gender === 'Boys') {
        gender.innerHTML = '<i class="fa-solid fa-person"></i>';
      } else if (item.gender === 'Girls') {
        gender.innerHTML = '<i class="fa-solid fa-person-dress"></i>';
      }

      ratingsGender.appendChild(ratings);
      ratingsGender.appendChild(gender);

      // Create the description section
      const description = document.createElement('div');
      description.classList.add('description');
      description.textContent = item.description;

      // Append all sections to the result-item container
      resultItem.appendChild(namePrice);
      resultItem.appendChild(mainImage);
      resultItem.appendChild(ratingsGender);
      resultItem.appendChild(description);

      // Append the result-item to the results container
      resultsContainer.appendChild(resultItem);
    });
  } else {
   resultsContainer.innerHTML = '<p>No results found.</p>';
  }
 } catch (error) {
  console.error('Error fetching data:', error);
 }
}

fetchData()

function showCheckout(hostel) {
const checkoutSection = document.getElementById('checkoutSection');
const checkoutDetails = document.getElementById('checkoutDetails');

let getGender = ''

 if(hostel.gender == 'Boys'){
  getGender = '<i class="fa-solid fa-person"></i>'
 }else if(hostel.gender == 'Both'){
  getGender = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person-dress"></i>'
 }else{
  getGender = '<i class="fa-solid fa-person-dress"></i>'
 }
 let getStars = ''; // Combined string for all stars

 const maxStars = 5;
 const fullStars = Math.floor(hostel.rating); // Full stars
 const halfStar = hostel.rating % 1 >= 0.5; // Check for half star
 
 for (let i = 0; i < maxStars; i++) {
   if (i < fullStars) {
     getStars += '<i class="fas fa-star"></i>'; // Add a full star
   } else if (i === fullStars && halfStar) {
     getStars += '<i class="fas fa-star-half-alt"></i>'; // Add a half star
   } else {
     getStars += '<i class="far fa-star"></i>'; // Add an empty star
   }
 }
 
// Fill the checkout section with hostel details
checkoutDetails.innerHTML = `
 <div class="leftSideCheck">
  <div class="headerSectionCheck">
   <div class="name-addressCheck">
    <div class="hostelNameCheck">${hostel.name}</div>
    <div class="hostelAddressCheck"><i class="fa-solid fa-location-dot"></i> <small>${hostel.address}</small></div>
   </div>
   <div class="ratings-genderCheck">
    <div class="priceCheck">₹${hostel.price_per_month}/month</div>
    <div class="starsBoxCheck">${getStars}</div>
    <div class="genderCheck">${getGender}</div>
   </div>
  </div>

 <div class="imagesContainer">
  <div class="imageBox">
   <img src="${hostel.main_image}" alt="hostelImage" width="98%" height="100%" style="object-fit:contain;object-position:center;"/>
  </div>

  <div class="imageBox">
   <img src="${hostel.room_images[0]}" alt="hostelImage" width="100%" height="100%" style="object-fit:contain;object-position:center;"/>
  </div>

  <div class="imageBox">
   <img src="${hostel.room_images[1]}" alt="hostelImage" width="100%" height="100%" style="object-fit:contain;object-position:center;"/>
  </div>
 </div>
 </div>

 <div class="rightSideCheck">
  <div class="facility-description">
   <div class="facilityCheck">
    <b>Facilities</b> - [ ${hostel.facilities} ]
   </div>
   <div class="descriptionCheck">
    ${hostel.description}
   </div>
  </div>

 <div class="reviews">
  <p>Reviews :</p>

  <div class="reviewCheck">
   <div class="reviewUser">
    <b>${hostel.reviews[0].user}</b> <small>@verified</small>
   </div>
   <div class="reviewComment">
    - ${hostel.reviews[0].comment}
   </div>
  </div>

  <div class="reviewCheck">
   <div class="reviewUser">
    <b>${hostel.reviews[1].user}</b> <small>@verified</small>
   </div>
   <div class="reviewComment">
    - ${hostel.reviews[1].comment}
   </div>
  </div>
 </div>
 </div>

 

`;

// Show the checkout section
checkoutSection.style.display = 'flex';

// Attach event listener to Confirm Booking button
document.getElementById('confirmBooking').addEventListener('click', function () {
 confirmBooking(hostel);
});
}

function closeCheckout(){
 const checkoutSection = document.getElementById('checkoutSection');
 const checkoutDetails = document.getElementById('checkoutDetails');

 checkoutSection.style.display = 'none'
 checkoutDetails.innerHTML = ''
}

function confirmBooking(hostel) {
 // Retrieve dates from input fields
 const getFromDate = document.getElementById('fromDate').value;
 const getToDate = document.getElementById('toDate').value;

 // Check if both dates are selected
 if (!getFromDate || !getToDate) {
     alert('Please choose both the "From" and "To" dates to book.');
     return; // Stop execution if dates are missing
 }

 // Prepare the booking data
 const booking = {
     name: hostel.name,
     address: hostel.address,
     price: hostel.price_per_month,
     date: new Date().toLocaleString(),
     from: getFromDate,
     to: getToDate
 };

 // Retrieve the user data from localStorage
 const userData = JSON.parse(localStorage.getItem('username'));

 // Validate user data and add the booking
 if (userData && Array.isArray(userData.bookings)) {
     // Check if a similar booking already exists for the same dates
     const isDuplicate = userData.bookings.some(b => b.from === getFromDate && b.to === getToDate);
     if (isDuplicate) {
         alert('You have already made a booking for these dates.');
         return;
     }

     // Add the new booking
     userData.bookings.push(booking);
     localStorage.setItem('username', JSON.stringify(userData));
     alert('Booking confirmed!');
     document.getElementById('checkoutSection').style.display = 'none';
 } else {
     alert('User data not found. Please log in or register.');
 }
}



window.onload = displayUsername;
