import { DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

export const SignupSlider = ( { hideDescription }: { hideDescription: boolean } ) => {
	const translate = useTranslate();

	const carouselSlides = [
		<div className="signup-slider__slide signup-slider__slide--1" key="slide-1">
			<div className="signup-slider__slide-content">
				<div className="signup-slider__slide-image" aria-hidden="true" />
				<p className="signup-slider__headline">
					{ translate( 'WordPress powers 43% of the web' ) }
				</p>
				{ ! hideDescription && (
					<p className="signup-slider__description">
						{ translate(
							'That’s 472+ million sites. From Barbara’s business to Sam’s blog, your site will be in good company.'
						) }
					</p>
				) }
			</div>
		</div>,
		<div className="signup-slider__slide signup-slider__slide--2" key="slide-2">
			<div className="signup-slider__slide-content signup-slider__slide-content--testimonial">
				<div className="signup-slider__slide-image" aria-hidden="true" />
				<p className="signup-slider__testimonial-text">
					{ translate(
						'“I wholeheartedly recommend WordPress.com to anyone seeking to build a professional, visually stunning website.”'
					) }
				</p>
				<p className="signup-slider__testimonial-author">{ translate( 'Barbara' ) }</p>
			</div>
		</div>,
		<div className="signup-slider__slide signup-slider__slide--3" key="slide-3">
			<div className="signup-slider__slide-content">
				<div className="signup-slider__slide-image" aria-hidden="true" />
				<p className="signup-slider__headline">{ translate( 'From idea to site in minutes' ) }</p>
				{ ! hideDescription && (
					<p className="signup-slider__description">
						{ translate(
							'With our AI website builder, describe what you want, and watch your site come together.'
						) }
					</p>
				) }
			</div>
		</div>,
		<div className="signup-slider__slide signup-slider__slide--4" key="slide-4">
			<div className="signup-slider__slide-content signup-slider__slide-content--testimonial">
				<div className="signup-slider__slide-image" aria-hidden="true" />
				<p className="signup-slider__testimonial-text">
					{ translate(
						'“I started with zero experience of running my own site, and WordPress.com made it easy to create something that really works for me and my site.”'
					) }
				</p>
				<p className="signup-slider__testimonial-author">{ translate( 'Sam' ) }</p>
			</div>
		</div>,
	];

	return (
		<DotPager className="signup-slider" hasDynamicHeight={ false } rotateTime={ 5000 }>
			{ carouselSlides }
		</DotPager>
	);
};
