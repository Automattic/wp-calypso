const SIXTEEN_BY_NINE = 16 / 9;

export default function swiperResize( swiper ) {
	const img = swiper.el.querySelector( '.swiper-slide[data-swiper-slide-index="0"] img' );
	if ( ! img ) {
		return;
	}
	const aspectRatio = img.clientWidth / img.clientHeight;
	const sanityAspectRatio = Math.max( Math.min( aspectRatio, SIXTEEN_BY_NINE ), 1 );
	const sanityHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;
	const swiperHeight = Math.min( swiper.width / sanityAspectRatio, sanityHeight );
	swiper.el.style.height = `calc( ${ Math.floor( swiperHeight ) }px + 4em )`;
	swiper.el.classList.add( 'wp-swiper-initialized' );
}
