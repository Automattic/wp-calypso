declare module 'swiper' {
	class Swiper {
		activeIndex: number;
		constructor( containerClass: string, options: unknown );
		destroy(): void;
	}

	export default Swiper;
}
