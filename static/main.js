function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function hexToRgba(hex) {
    let c;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');

        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }

        c = `0x${c.join('')}`;
        return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},0.1)`;
    } else console.error('[Election Widget] Bad Hex');
}

function debounce(fn, delay) {
    let timer = null;

    // eslint-disable-next-line func-names
    return function () {
        const context = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;

        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, delay);
    };
}

function isInViewport(el) {
    const {
        left, right
    } = el.getBoundingClientRect();
    const { innerWidth } = window;

    // the 'magic number' 37 is obtained by adding the margin
    // and the space occupied by the navigation arrows
    return (left - 37) >= 0 && (right + 37) <= innerWidth;
}

function scrollHorizontally(element, direction) {
    let scrollAmount = 0;
    const step = 10;

    var slideTimer = setInterval(() =>{
        if (direction == 'left') {
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }

        scrollAmount += step;

        if (scrollAmount >= 100) {
            window.clearInterval(slideTimer);
        }
    }, 25);
}

function setScrollLogic() {
    const resultsWrapper = document.getElementById('election_results');

    if (!resultsWrapper) return;

    const arrowLeft = document.querySelector('.arrow_left');
    const arrowRight = document.querySelector('.arrow_right');
    const electionResultsWrapper = resultsWrapper.parentNode;

    if (electionResultsWrapper.offsetWidth >= electionResultsWrapper.scrollWidth) {
        arrowLeft.classList.add('remove');
        arrowRight.classList.add('remove');

        return;
    } else {
        arrowLeft.classList.remove('remove');
        arrowRight.classList.remove('remove');
    }

    const firstItem = resultsWrapper.querySelector('.person_data:first-child');
    const lastItem = resultsWrapper.querySelector('.person_data:last-child');

    arrowRight.addEventListener('click', () => {
        scrollHorizontally(electionResultsWrapper, 'right');
    });

    arrowLeft.addEventListener('click', () => {
        scrollHorizontally(electionResultsWrapper, 'left');
    });

    electionResultsWrapper.addEventListener('scroll', debounce(() => {
        if (window.isInViewport(firstItem)) {
            arrowLeft.classList.add('not_active');
        } else {
            arrowLeft.classList.remove('not_active');
        }

        if (window.isInViewport(lastItem)) {
            arrowRight.classList.add('not_active');
        } else {
            arrowRight.classList.remove('not_active');
        }
    }, 10), { passive: true });
}

function placeDataInHtml() {
    document.getElementById('election_results').replaceChildren();

    const template = document.getElementById('person_data_template');

    if (!template) return;

    const fragment = new DocumentFragment();

    for (let i = 0; i < 12; i++) {
        const templateClone = template.content.cloneNode(true);
        const percentWrapper = templateClone.querySelector('.percent');
        const percent = (Math.random() * 100).toFixed(2);
        percentWrapper.innerText = `${percent}%`;

        const graph = templateClone.querySelector('.graph');
        const graphSpanColor = getRandomColor();
        const graphColor = hexToRgba(graphSpanColor);
        graph.style.backgroundColor = graphColor;

        const graphSpan = templateClone.querySelector('span');
        const percentInPixel = (percent / 100) * 204;
        graphSpan.style.height = `${percentInPixel}px`;
        graphSpan.style.backgroundColor = graphSpanColor;

        const img = templateClone.querySelector('img');
        img.style.backgroundColor = graphColor;

        fragment.appendChild(templateClone);
    }

    const resultsElement = document.getElementById('election_results');
    resultsElement.appendChild(fragment);
}

window.addEventListener('resize', window.debounce(() => {
    setScrollLogic();
}, 200));

document.addEventListener('DOMContentLoaded', () => {
    placeDataInHtml();
    setScrollLogic();

    const loaderWrapper = document.querySelector('.loader_wrapper');
    if (loaderWrapper) loaderWrapper.style.display = 'none';
});
