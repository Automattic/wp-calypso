const SIXTEEN_BY_NINE = 16 / 9;
const MAX_HEIGHT_PERCENT_OF_WINDOW_HEIGHT = 0.8;
const SANITY_MAX_HEIGHT = 600;

function swiperInit( swiper ) {
	swiperResize( swiper );
	swiperApplyAria( swiper );
}

function swiperResize( swiper ) {
	const img = swiper.el.querySelector( '.swiper-slide[data-swiper-slide-index="0"] img' );
	if ( ! img ) {
		return;
	}
	const aspectRatio = img.clientWidth / img.clientHeight;
	const sanityAspectRatio = Math.max( Math.min( aspectRatio, SIXTEEN_BY_NINE ), 1 );
	const sanityHeight =
		typeof window !== 'undefined'
			? window.innerHeight * MAX_HEIGHT_PERCENT_OF_WINDOW_HEIGHT
			: SANITY_MAX_HEIGHT;
	const swiperHeight = Math.min( swiper.width / sanityAspectRatio, sanityHeight );
	const wrapperHeight = `${ Math.floor( swiperHeight ) }px`;
	const buttonTop = `${ Math.floor( swiperHeight / 2 ) }px`;

	swiper.el.classList.add( 'wp-swiper-initialized' );
	swiper.wrapperEl.style.height = wrapperHeight;
	swiper.el.querySelector( '.wp-block-jetpack-slideshow_button-prev' ).style.top = buttonTop;
	swiper.el.querySelector( '.wp-block-jetpack-slideshow_button-next' ).style.top = buttonTop;
}

function swiperApplyAria( swiper ) {
	for ( let index = 0; index < swiper.slides.length; index++ ) {
		swiper.slides[ index ].setAttribute(
			'aria-hidden',
			index === swiper.activeIndex ? 'false' : 'true'
		);
	}
}

export { swiperApplyAria, swiperInit, swiperResize };
