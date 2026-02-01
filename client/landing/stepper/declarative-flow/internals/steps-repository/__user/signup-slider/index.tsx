import { DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import slideImage1 from './images/img-01.png';
import slideImage1x2 from './images/img-01@2x.png';
import slideImage2 from './images/img-02.png';
import slideImage2x2 from './images/img-02@2x.png';
import slideImage3 from './images/img-03.png';
import slideImage3x2 from './images/img-03@2x.png';
import slideImage4 from './images/img-04.png';
import slideImage4x2 from './images/img-04@2x.png';

import './style.scss';

export const SignupSlider = ( { hideDescription }: { hideDescription: boolean } ) => {
	const translate = useTranslate();

	const carouselSlides = [
		<div className="signup-slider__slide signup-slider__slide--1" key="slide-1">
			<div className="signup-slider__slide-content">
				<div className="signup-slider__slide-image-container">
					<img
						className="signup-slider__slide-image signup-slider__slide-image--1"
						src={ slideImage1 }
						srcSet={ `${ slideImage1 } 1x, ${ slideImage1x2 } 2x` }
						alt=""
						aria-hidden="true"
					/>
				</div>
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
				<div className="signup-slider__slide-image-container">
					<img
						className="signup-slider__slide-image signup-slider__slide-image--2"
						src={ slideImage2 }
						srcSet={ `${ slideImage2 } 1x, ${ slideImage2x2 } 2x` }
						alt=""
						aria-hidden="true"
					/>
				</div>
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
				<div className="signup-slider__slide-image-container">
					<img
						className="signup-slider__slide-image signup-slider__slide-image--3"
						src={ slideImage3 }
						srcSet={ `${ slideImage3 } 1x, ${ slideImage3x2 } 2x` }
						alt=""
						aria-hidden="true"
					/>
				</div>
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
				<div className="signup-slider__slide-image-container">
					<img
						className="signup-slider__slide-image signup-slider__slide-image--4"
						src={ slideImage4 }
						srcSet={ `${ slideImage4 } 1x, ${ slideImage4x2 } 2x` }
						alt=""
						aria-hidden="true"
					/>
				</div>
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
