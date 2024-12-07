function displayBookings() {
 const userData = JSON.parse(localStorage.getItem('username'));

 if (userData && userData.bookings.length > 0) {
   const bookingsContainer = document.getElementById('bookingsContainer');
   bookingsContainer.innerHTML = ''; // Clear any previous content

   userData.bookings.forEach((booking, index) => {
     const bookingItem = document.createElement('div');
     bookingItem.classList.add('booking-item');
     bookingItem.innerHTML = `
       <div class="hostelDetailsBook">
        <h3>${booking.name}</h3>
        <p><i class="fa-solid fa-location-dot fa-xl"></i> ${booking.address}</p>
        <p>₹${booking.price}/month</p>
       </div>
       <div class="bookingDetails">
        <p><b>Booking Date : </b>${booking.date}</p>
        <p><b>From : </b>${booking.from}</p>
        <p><b>To : </b>${booking.to}</p>
       </div>
        <button class="deleteBookingBtn">cancel</button>
     `;
     bookingsContainer.appendChild(bookingItem);
   });
 } else {
   alert('No bookings found.');
 }
}

function deleteBooking(index) {
 const userData = JSON.parse(localStorage.getItem('username'));

 if (userData && userData.bookings.length > index) {
   // Remove the selected booking
   userData.bookings.splice(index, 1);

   // Update local storage
   localStorage.setItem('username', JSON.stringify(userData));

   // Refresh the displayed bookings
   displayBookings();

   alert('Booking deleted successfully.');
 } else {
   alert('Invalid booking index.');
 }
}

displayBookings()
