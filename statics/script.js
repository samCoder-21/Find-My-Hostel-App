const qaBoxes = document.querySelectorAll('.qaBox');

const len = qaBoxes.length;

for (let i = 0; i < len; i++) {
 qaBoxes[i].addEventListener('click', () => {
  const icon = qaBoxes[i].children[0].children[0]; // The <i> element
  const answer = qaBoxes[i].children[1]; // The answer <div>
  
  if (answer.style.display === 'none' || !answer.style.display) {
   answer.style.display = 'block';
   icon.classList.remove('fa-caret-down');
   icon.classList.add('fa-caret-up');
  } else {
   answer.style.display = 'none';
   icon.classList.remove('fa-caret-up');
   icon.classList.add('fa-caret-down');
  }
 });
}

 // Initialize the map
 const map = L.map('map').setView([0, 0], 13); // Default location until geolocation works

 // Add OpenStreetMap tiles
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 }).addTo(map);

 // Geolocation API to get user's current location
 if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
   (position) => {
     const { latitude, longitude } = position.coords;

     // Update the map's center and zoom to the user's location
     map.setView([latitude, longitude], 13);

     // Add a marker at the user's location
     L.marker([latitude, longitude])
     .addTo(map)
     .bindPopup('visit us here')
     .openPopup();
   },
   (error) => {
    console.error('Error obtaining location:', error.message);
   }
  );
 } else {
  alert('Geolocation is not supported by your browser.');
 }


// get started button logic
const userDetails = JSON.parse(localStorage.getItem('username'))
const getStartBtn = document.querySelector('#getstart')
const dashboardBtn = document.querySelector('#dashboard')
const searchBtn = document.querySelector('.searchBtn1')

if (userDetails.status == 'loggedIn') {
 getStartBtn.style.display = 'none'
 dashboardBtn.style.display = 'flex'
 searchBtn.style.display = 'none'
} else {
 getStartBtn.style.display = 'flex'
 dashboardBtn.style.display = 'none'
 searchBtn.style.display = 'flex'
}

// hanldling register form
function handleRegister(){

}