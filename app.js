import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANpVeVdq2g8BpK-sQoxh0uUVKgvUTt0FQ",
    authDomain: "hackathon-management-sys-3c4a0.firebaseapp.com",
    projectId: "hackathon-management-sys-3c4a0",
    storageBucket: "hackathon-management-sys-3c4a0.appspot.com",
    messagingSenderId: "221549984006",
    appId: "1:221549984006:web:26f62be0acd69cd5c30687",
    measurementId: "G-N5HZKYGPDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Array to store team members
const teamMembers = [];
const registeredEmails = new Set();

document.addEventListener("DOMContentLoaded", () => {
    // Login functionality
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailOrMobile = document.getElementById('login-input').value.trim();
            const password = document.getElementById('password').value;

            try {
                await signInWithEmailAndPassword(auth, emailOrMobile, password);
                alert('Login successful! Redirecting to team registration...');
                window.location.href = "team-registration.html"; 
            } catch (error) {
                console.error("Login error:", error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // Team Registration functionality
    const teamRegistrationForm = document.getElementById('team-registration-form');
    const registrationStatus = document.getElementById('registration-status');
    const proceedToPaymentBtn = document.getElementById('proceed-to-payment');

    if (teamRegistrationForm) {
        teamRegistrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const memberName = document.getElementById('member-name').value.trim();
            const memberEmail = document.getElementById('member-email').value.trim();

            // Check if the email is already registered
            if (registeredEmails.has(memberEmail)) {
                alert("This email is already registered. Please enter a different email.");
                return;
            }

            // Limit to 4 members
            if (teamMembers.length >= 4) {
                alert("You can only register up to 4 team members.");
                return;
            }

            // Add member to the team
            teamMembers.push({ name: memberName, email: memberEmail });
            registeredEmails.add(memberEmail);
            registrationStatus.innerHTML += `<p>Member Added: ${memberName} (${memberEmail})</p>`;

            // Clear the input fields
            document.getElementById('member-name').value = '';
            document.getElementById('member-email').value = '';

            // Check if 4 members have been added
            if (teamMembers.length === 4) {
                proceedToPaymentBtn.style.display = 'block';

                // Save team members to Firebase Realtime Database
                const userId = auth.currentUser.uid; // Get the current user's ID
                const teamRef = ref(database, 'teams/' + userId);
                
                try {
                    await set(teamRef, { members: teamMembers });
                    console.log("Team members saved to database.");

                    // Send email notifications
                    await fetch('http://localhost:3001/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ members: teamMembers }),
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Error sending emails');
                        alert('Registration emails sent to all members!');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to send registration emails.');
                    });

                } catch (dbError) {
                    console.error("Database error:", dbError);
                    alert('Failed to save team members to database.');
                }
            }
        });

        proceedToPaymentBtn.addEventListener('click', () => {
            alert("Proceeding to payment...");
            window.location.href = "payment.html"; 
        });
    }
});
