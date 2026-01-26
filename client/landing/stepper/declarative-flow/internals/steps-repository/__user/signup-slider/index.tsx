import { DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export const SignupSlider = () => {
	const translate = useTranslate();

	const carouselSlides = [
		<div className="signup-slider__slide signup-slider__slide--1" key="slide-1">
			<div className="signup-slider__slide-content">
				<p className="signup-slider__headline">
					{ translate( 'Join 472+ million websites worldwide' ) }
				</p>
			</div>
		</div>,
		<div className="signup-slider__slide signup-slider__slide--2" key="slide-2">
			<div className="signup-slider__slide-content signup-slider__slide-content--testimonial">
				<p className="signup-slider__testimonial-text">
					{ translate(
						'WordPress.com has made it easy to manage multiple news sites and blogs, letting me focus on the content rather than the technical aspects.'
					) }
				</p>
				<p className="signup-slider__testimonial-author">{ translate( 'Brett S.' ) }</p>
				<p className="signup-slider__testimonial-role">
					{ translate( 'Founder/Blogger in Chief' ) }
				</p>
			</div>
		</div>,
		<div className="signup-slider__slide signup-slider__slide--3" key="slide-3">
			<div className="signup-slider__slide-content">
				<p className="signup-slider__headline">
					{ translate( 'AI builds the site — you make it yours' ) }
				</p>
			</div>
		</div>,
	];

	return (
		<DotPager className="signup-slider" hasDynamicHeight={ false } rotateTime={ 5000 }>
			{ carouselSlides }
		</DotPager>
	);
};
