// Scroll
window.addEventListener('scroll', function() {
    var header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 0);
});

// Responsive Menu
document.addEventListener("DOMContentLoaded", function() {
    $(document).ready(function(){
        $('#nav-icon3').click(function(){
            $(this).toggleClass('open');
        });
    });
    const responsiveMenuIcon = document.getElementById("nav-icon3");
    const responsiveMenu = document.getElementById("responsive-menu");

    responsiveMenuIcon.addEventListener("click", function() {
        responsiveMenu.classList.toggle("active");
    });

    const menuLinks = document.querySelectorAll("#responsive-menu .menu-link");

    menuLinks.forEach(function(menuLink) {
        menuLink.addEventListener("click", function() {
            menuLinks.forEach(function(link) {
                link.classList.remove("active");
            });
            menuLink.classList.add("active");
            responsiveMenu.classList.remove("active");
        });
    });
});



function openCategory(category) {
    var categories = document.querySelectorAll('.category');
    categories.forEach(function(categoryElement) {
        categoryElement.style.display = 'none';
    });

    var selectedCategory = document.getElementById(category);
    selectedCategory.style.display = 'block';

    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    var clickedTab = document.querySelector('.tab[data-category="' + category + '"]');
    clickedTab.classList.add('active');
}


  
  














