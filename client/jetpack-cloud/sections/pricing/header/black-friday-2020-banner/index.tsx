/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import banner from './black-friday-2020-banner.png';
import banner2x from './black-friday-2020-banner-2x.png';
import bannerMobile from './black-friday-2020-banner_mobile.png';
import bannerMobile2x from './black-friday-2020-banner_mobile-2x.png';

/**
 * Style dependencies
 */
import './style.scss';

const BlackFriday2020Banner: React.FC = () => {
	const translate = useTranslate();
	return (
		<div className="black-friday-2020-banner">
			<picture className="black-friday-2020-banner__image">
				<source
					media="(max-width: 679px)"
					srcSet={ `${ bannerMobile } 375w, ${ bannerMobile2x } 750w` }
				/>

				<source media="(min-width: 680px)" srcSet={ `${ banner } 1080w, ${ banner2x } 2160w` } />

				<img
					src={ `${ banner }` }
					alt={ translate(
						'Black Friday Sale! Use code JETBLACK at checkout through November 30.',
						{
							comment: 'JETBLACK is the coupon code used in the checkout process.',
						}
					) }
				/>
			</picture>
		</div>
	);
};

export default BlackFriday2020Banner;
