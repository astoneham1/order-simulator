document.addEventListener('DOMContentLoaded', () => {

    // fade in
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 50);

    // fade out
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');

            // animate if an internal link only
            if (target && target.startsWith('http') === false && target !== '#') {
                e.preventDefault(); // STOP the immediate navigation

                // start fading out
                document.body.classList.remove('page-loaded');

                // wait for animation then change page
                setTimeout(() => {
                    window.location.href = target;
                }, 200);
            }
        });
    });
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.add('page-loaded');
    }
});