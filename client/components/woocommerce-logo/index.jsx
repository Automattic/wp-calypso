import PropTypes from 'prop-types';

import './style.scss';

function WooCommerceLogo( { className = 'woocommerce-logo', size = 72 } ) {
	return (
		<svg className={ className } width={ size } viewBox="0 0 72 43">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M65.2989 0H6.72025C3.00794 0 0 3.00794 0 6.70123V29.0514C0 32.7447 3.00794 35.7527 6.70123 35.7527H34.4581L47.1562 42.8157L44.2816 35.7527H65.2989C68.9921 35.7527 72 32.7447 72 29.0514V6.70123C72 3.00794 68.9921 0 65.2989 0ZM5.48284 5.15918C4.75944 5.17828 4.09311 5.52096 3.63615 6.07302C3.1983 6.64417 3.02696 7.36757 3.17928 8.09104C4.91169 19.1328 6.52989 26.5765 8.0339 30.4221C8.58596 31.831 9.27131 32.4972 10.0709 32.4402C11.2893 32.345 12.7742 30.6506 14.5067 27.319C14.892 26.5485 15.3617 25.6123 15.9132 24.5131L15.9134 24.5126L15.9163 24.5068C16.6995 22.9459 17.6473 21.0569 18.7521 18.8473C20.3513 24.3872 22.5215 28.5564 25.263 31.355C26.0435 32.1355 26.805 32.4972 27.5855 32.4402C28.2519 32.402 28.8611 31.9832 29.1466 31.374C29.4321 30.7838 29.5654 30.1176 29.4893 29.4512C29.2989 26.767 29.5845 23.0165 30.3079 18.2381C31.0504 13.2883 32.0022 9.74729 33.1445 7.61506C33.3729 7.19623 33.4682 6.70123 33.4301 6.20631C33.392 5.53998 33.0684 4.91169 32.5353 4.51195C32.0213 4.07409 31.355 3.86463 30.6887 3.92177C29.851 3.95981 29.1086 4.45481 28.7469 5.21632C26.9382 8.54792 25.6437 13.9546 24.8631 21.4173C23.6257 18.1619 22.6929 14.7923 22.0837 11.3655C21.76 9.61399 20.9605 8.79541 19.6659 8.89059C18.7711 8.94773 18.0477 9.53783 17.4575 10.642L11.0037 22.9023C9.95667 18.6188 8.96675 13.4025 8.05292 7.27239C7.82444 5.76838 6.96775 5.064 5.48284 5.15918ZM48.4319 10.6992C47.442 8.92863 45.7286 7.67213 43.7296 7.29141C43.1965 7.17721 42.6635 7.12007 42.1305 7.12007C39.3129 7.12007 37.0093 8.58596 35.2198 11.5177C33.6967 14.0117 32.8972 16.8864 32.9353 19.7991C32.9353 22.0646 33.4112 24.0064 34.3441 25.6247C35.3341 27.3952 37.0474 28.6516 39.0464 29.0324C39.5794 29.1466 40.1124 29.2037 40.6456 29.2037C43.4822 29.2037 45.7857 27.7379 47.5562 24.806C49.0792 22.2931 49.8787 19.4184 49.8407 16.4675C49.8407 14.2021 49.3647 12.2793 48.4319 10.6992ZM44.7196 18.8663C44.3198 20.7891 43.5773 22.2359 42.4731 23.2259C41.6164 24.0064 40.8169 24.3111 40.0934 24.1778C39.37 24.0445 38.7989 23.3972 38.361 22.274C38.0374 21.4173 37.847 20.5225 37.847 19.5897C37.847 18.8663 37.9231 18.1429 38.0564 17.4384C38.342 16.182 38.856 15.0017 39.6175 13.9355C40.5884 12.5077 41.6164 11.8985 42.6825 12.1269C43.406 12.2793 43.9771 12.9075 44.415 14.0308C44.7386 14.8875 44.929 15.7822 44.929 16.696C44.929 17.4194 44.8719 18.1429 44.7196 18.8663ZM62.1578 7.29141C64.1569 7.67213 65.8703 8.92863 66.8598 10.6992C67.7931 12.2793 68.2691 14.2021 68.2691 16.4675C68.3068 19.4184 67.5075 22.2931 65.9843 24.806C64.2139 27.7379 61.9106 29.2037 59.0737 29.2037C58.5409 29.2037 58.008 29.1466 57.4743 29.0324C55.476 28.6516 53.7623 27.3952 52.7723 25.6247C51.8395 24.0064 51.3636 22.0646 51.3636 19.7991C51.3255 16.8864 52.1251 14.0117 53.648 11.5177C55.4375 8.58596 57.7415 7.12007 60.5584 7.12007C61.0921 7.12007 61.625 7.17721 62.1578 7.29141ZM60.9011 23.2259C62.0054 22.2359 62.7477 20.7891 63.1481 18.8663C63.2998 18.1429 63.3576 17.4194 63.3576 16.696C63.3576 15.7822 63.1666 14.8875 62.8432 14.0308C62.405 12.9075 61.8344 12.2793 61.1106 12.1269C60.0448 11.8985 59.0168 12.5077 58.0457 13.9355C57.2841 15.0017 56.7705 16.182 56.4848 17.4384C56.3516 18.1429 56.2753 18.8663 56.2753 19.5897C56.2753 20.5225 56.4655 21.4173 56.789 22.274C57.2271 23.3972 57.7985 24.0445 58.5216 24.1778C59.2455 24.3111 60.0448 24.0064 60.9011 23.2259Z"
			/>
		</svg>
	);
}

WooCommerceLogo.propTypes = {
	className: PropTypes.string,
	size: PropTypes.number,
};

export default WooCommerceLogo;
