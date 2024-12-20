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
    } else {
        console.error(`[Elections Widget] It was not possible to create an rgba color because the hex color '${hex}' is not valid`);
    }
}

function isInViewport(el) {
    if (!el) return false;

    const {
        left, right
    } = el.getBoundingClientRect();
    const { innerWidth } = window;
    /**
     * the 'magic number' 37 is obtained by adding the margin
     * and the space occupied by the navigation arrows
     */
    return (left - 37) >= 0 && (right + 37) <= innerWidth;
}

function debounce(fn, delay) {
    let timer = null;

    return function () {
        const context = this;
        const args = arguments;

        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, delay);
    };
}

function scrollWidgetElement (wrapper, itemWidth) {
    wrapper.scrollBy({
        left: itemWidth,
        behavior: 'smooth'
    });
}

function setScrollLogic() {
    const resultsWrapper = document.getElementById('election_results');

    if (!resultsWrapper) return;

    const arrowLeft = document.querySelector('.arrow_left');
    const arrowRight = document.querySelector('.arrow_right');
    const electionResultsWrapper = resultsWrapper.parentNode;

    if (!arrowLeft || !arrowRight) return;

    if (electionResultsWrapper.offsetWidth >= electionResultsWrapper.scrollWidth) {
        arrowLeft.classList.add('remove');
        arrowRight.classList.add('remove');

        return;
    } else {
        arrowLeft.classList.remove('remove');
        arrowRight.classList.remove('remove');
    }

    const personDataItem = resultsWrapper.querySelector('.person_data');
    if (personDataItem) {
        /**
         * In order for the scrolling to be for exactly one candidate,
         * 16 should be added, which is the space between the cards.
        */
        const itemWidth = (Math.round((personDataItem.getBoundingClientRect().width + Number.EPSILON) * 100) / 100) + 16;

        arrowRight.addEventListener('click', () => {
            scrollWidgetElement(electionResultsWrapper, itemWidth);
        });

        arrowLeft.addEventListener('click', () => {
            scrollWidgetElement(electionResultsWrapper, -itemWidth);
        });

        document.querySelector('.cro_elections')?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                scrollWidgetElement(electionResultsWrapper, -itemWidth);
            } else if (e.key === 'ArrowRight') {
                scrollWidgetElement(electionResultsWrapper, itemWidth);
            }
        });
    }

    const firstItem = resultsWrapper.querySelector('.person_data:first-child');
    const lastItem = resultsWrapper.querySelector('.person_data:last-child');

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

    const candidatesImages = ['bulj', 'jonjic', 'kartelo', 'kekin', 'lozo', 'milanovic', 'primorac', 'selak'];
    const candidatesNames = {
        'bulj': 'Miro Bulj',
        'jonjic': 'Tomislav Jonjić',
        'kartelo': 'Niko Tokić Kartelo',
        'kekin': 'Ivana Kekin',
        'lozo': 'Branka Lozo',
        'milanovic': 'Zoran Milanović',
        'primorac': 'Dragan Primorac',
        'selak': 'Marija Selak Raspudić'
    };

    const fragment = new DocumentFragment();

    for (let i = 0; i < 8; i++) {
        const templateClone = template.content.cloneNode(true);
        const percentWrapper = templateClone.querySelector('.percent');
        const percent = (Math.random() * 100).toFixed(2);
        percentWrapper.innerText = `${percent}%`;

        const graph = templateClone.querySelector('.graph');
        const graphSpanColor = getRandomColor();
        const graphColor = hexToRgba(graphSpanColor);
        graph.style.backgroundColor = graphColor;

        const graphSpan = templateClone.querySelector('span');
        const percentInPixel = (percent / 100) * 253;
        graphSpan.style.height = `${percentInPixel}px`;
        graphSpan.style.backgroundColor = graphSpanColor;

        const img = templateClone.querySelector('img');
        img.style.backgroundColor = graphColor;
        img.style.backgroundImage = 'url()';
        const candidateImage = candidatesImages[i];
        const candidateName = candidatesNames[candidateImage]
        img.src = `./static/images/${candidateImage}.png`;
        img.alt = candidateName;

        const name = templateClone.querySelector('.name');
        name.innerText = candidateName;

        fragment.appendChild(templateClone);
    }

    const resultsElement = document.getElementById('election_results');
    resultsElement.appendChild(fragment);
}

function setCss() {
    const queryParam = ((new URLSearchParams(window.location.search)).get('portal'))?.toLowerCase();

    if (queryParam === '24sata') {
        document.documentElement.style.setProperty('--fontDefault', 'var(--font24sata)');
        document.documentElement.style.setProperty('--fontTitleDefault', 'var(--fontTitle24sata)');
        document.documentElement.style.setProperty('--titleFontWeightDefault', 'var(--titleFontWeight24sata)');
        document.documentElement.style.setProperty('--backgroundDefault', 'var(--background24sata)');
        document.documentElement.style.setProperty('--titleFontSizeDefault', 'var(--titleFontSize24sata)');
        document.documentElement.style.setProperty('--fontPercentDefault', 'var(--fontPercent24sata)');
        document.documentElement.style.setProperty('--percentFontWeightDefault', 'var(--percentFontWeight24sata)');
    } else if (queryParam === 'vl') {
        document.documentElement.style.setProperty('--fontDefault', 'var(--fontVL)');
        document.documentElement.style.setProperty('--fontTitleDefault', 'var(--fontTitleVL)');
        document.documentElement.style.setProperty('--titleFontWeightDefault', 'var(--titleFontWeightVL)');
        document.documentElement.style.setProperty('--backgroundDefault', 'var(--backgroundVL)');
        document.documentElement.style.setProperty('--titleFontSizeDefault', 'var(--titleFontSizeVL)');
        document.documentElement.style.setProperty('--fontPercentDefault', 'var(--fontPercentVL)');
        document.documentElement.style.setProperty('--percentFontWeightDefault', 'var(--percentFontWeightVL)');
    } else console.info(`[Elections Widget] The font and color are not adjusted because the portal '${queryParam}' is not recognized.`);
}

document.addEventListener('DOMContentLoaded', () => {
    setCss()
    placeDataInHtml();
    setScrollLogic();

    const loaderWrapper = document.querySelector('.loader_wrapper');
    if (loaderWrapper) loaderWrapper.style.display = 'none';
});

window.addEventListener('resize', debounce(() => {
    setScrollLogic();
}, 200));
