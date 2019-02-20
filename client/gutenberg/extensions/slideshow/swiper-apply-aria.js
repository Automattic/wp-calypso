export default function swiperApplyAria( swiper ) {
	for ( let index = 0; index < swiper.slides.length; index++ ) {
		swiper.slides[ index ].setAttribute(
			'aria-hidden',
			index === swiper.activeIndex ? 'false' : 'true'
		);
	}
}
