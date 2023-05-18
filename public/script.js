let schools = [];
const totalPages = 5; 
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://votemyschool.herokuapp.com/schools')
      .then(response => response.json())
      .then(data => {
          schools = data;
          initializeApp();
          populateSchoolList();

      })
      .catch(err => console.error(err));
});


function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = "";

  if (results.length > 0) {
    searchResults.style.display = "block";
    results.forEach((result) => {
      const resultElement = document.createElement("p");
      resultElement.textContent = result.name;
      resultElement.addEventListener("click", () => {
        displaySelectedSchool(result.id);
        document.getElementById("searchBar").value = "";
        searchResults.style.display = "none";
      });
      searchResults.appendChild(resultElement);
    });
  } else {
    searchResults.style.display = "none";
  }
}

function searchSchools(searchValue) {
  const searchTerm = searchValue.toLowerCase();
  const results = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm)
  );
  counter += 1;
  displaySearchResults(results);
}



function initializeApp() {
  // Populate the page numbers container
// limit to 5 pages
  const pageNumbers = document.getElementById("pageNumbers");
  for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement("span");
      pageNumber.classList.add("page-number");
      pageNumber.id = `page-number-${i}`;
      pageNumber.innerText = i;
      pageNumber.onclick = () => goToPage(i);
      pageNumbers.appendChild(pageNumber);
  }

  // Call displaySchoolsPage after generating the page numbers
  displaySchoolsPage(1);
  console.log("displaySchoolspage2");
}

let counter = 0;

function displaySelectedSchool(schoolId) {
  const school = schools.find(s => s.id === schoolId);
  if (school) {
      const schoolList = document.getElementById('schoolList');
      schoolList.innerHTML = '';
      addSchoolToDOM(school);
      document.getElementById('mainTitle').innerText = 'Selected School';
      document.getElementById('mainTitle').style.display = 'block';
      document.getElementById('bouncingTitle').style.display = 'none';
      document.getElementById('backToMain').style.display = 'block';
  }
}
// function updateSchoolLikes(schoolId) {
//   const school = schools.find(s => s.id === schoolId);
//   if (school) {
//       document.getElementById(`likes-${schoolId}`).textContent = `Likes: ${school.likes}`;
//   }
// }


function voteForSchool(schoolId) {
  if (counter > 0) {
    fetch(`http://localhost:3000/vote?schoolId=${schoolId}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const school = schools.find(school => school.id === schoolId);
        if (school) {
            school.likes = data.likes;

            // Check if we're on the main page
            const mainTitle = document.getElementById('mainTitle');
            if (mainTitle.innerText === 'Selected School') {
                displaySelectedSchool(school.id);
                console.log("selected page displayed");
            } 
            else {
                populateSchoolList();
                console.log("populate school");
            }
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
    });
  }
}


function addSchoolToDOM(school) {
  const schoolList = document.getElementById('schoolList');
  const schoolBox = document.createElement('div');
  schoolBox.classList.add('school-box');
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=http://localhost:3000/schools/${school.id}`;
  const twLink = `https://twitter.com/intent/tweet?url=http://localhost:3000/schools/${school.id}&text=Check%20out%20this%20school!`;
  
  schoolBox.innerHTML = `
    <span class="rank">#${school.rank}</span>
    <h3>${school.name}</h3>
    <p class="likes">${school.likes} <span class="heart" id="heart-${school.id}">&hearts;</span></p>
  `;
  schoolList.appendChild(schoolBox);
  schoolBox.addEventListener('click', () => {
    displaySelectedSchool(school.id);
    if(counter > 0){
      voteForSchool(school.id);
    }
    counter+=1;
    console.log("displayschool activated");
  });
}





function populateSchoolList() {
  const sortedSchools = schools.sort((a, b) => b.likes - a.likes).slice(0, 100);
  sortedSchools.forEach((school, index) => {
      school.rank = index + 1;
  });

  // Only keep the top 100 schools
  //schools = sortedSchools.slice(0, 100);

  displaySchoolsPage(1);
  console.log("displaysSchoolsPage1");
  document.getElementById('mainTitle').style.display = 'none';
  document.getElementById('bouncingTitle').style.display = 'block';
  document.getElementById('backToMain').style.display = 'none';
  counter = 0;
}


const itemsPerPage = 20;
let currentPage = 1;

function displaySchoolsPage(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const sortedSchools = schools.sort((a, b) => b.likes - a.likes);
  sortedSchools.forEach((school, index) => {
      school.rank = index + 1;
  });

  // Only slice the schools for current page
  const displayedSchools = sortedSchools.slice(start, end);
  const schoolList = document.getElementById("schoolList");
  schoolList.innerHTML = "";

  for (const school of displayedSchools) {
    addSchoolToDOM(school);
  }

  let currentPageElement = document.querySelector(".page-number.current");
  if (currentPageElement) {
      currentPageElement.classList.remove("current");
  }
  document.getElementById(`page-number-${page}`).classList.add("current");
}


  
function goToPage(page) {
  currentPage = page;
  displaySchoolsPage(page);
  updatePageButtons();
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage += 1;
    displaySchoolsPage(currentPage);
    updatePageButtons();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage -= 1;
    displaySchoolsPage(currentPage);
    updatePageButtons();
  }
}

function updatePageButtons() {
  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages;
}



// Populate the page numbers container

