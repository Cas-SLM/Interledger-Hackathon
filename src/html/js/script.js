// script.js

// Sample data object
const data = [
    { title: "Card 1", description: "This is the first card." },
    { title: "Card 2", description: "This is the second card." },
    { title: "Card 3", description: "This is the third card." }
];

// Function to load the HTML template from a file
function loadTemplate() {
    return fetch('dashboard.html')
        .then(response => response.text())
        .catch(error => console.error('Error loading template:', error));
}

// Function to create card HTML from the template and data
function createCardHTML(template, title, description) {
    // Create a temporary DOM element to manipulate the template
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template;

    // Populate the template with data
    tempDiv.querySelector('.title').textContent = title;
    tempDiv.querySelector('.description').textContent = description;

    return tempDiv.innerHTML; // Return the populated HTML as a string
}

// Function to inject all cards into the container
function injectCards() {
    loadTemplate().then(template => {
        const container = document.getElementById('container');

        data.forEach(item => {
            const cardHTML = createCardHTML(template, item.title, item.description);
            container.innerHTML += cardHTML; // Append the populated card HTML to the container
        });
    });
}

// Call the function to inject cards when the script loads
injectCards();
