/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import * as Images from './images';

const getSafeLocaleSlug = ( state: AppState ) => {
	return ( getCurrentLocaleSlug( state ) || 'en' ).replace( '-', '_' );
};

const useBannerImages = () => {
	const locale = useSelector( getSafeLocaleSlug );

	return useMemo( () => {
		const safeLocale = locale in Images.Mobile ? locale : 'en';

		return {
			// @ts-expect-error: We're picking images dynamically based on locale,
			// but we use 'en' as a guaranteed fallback
			mobile: Images.Mobile[ safeLocale ],

			// @ts-expect-error: We're picking images dynamically based on locale,
			// but we use 'en' as a guaranteed fallback
			mobile2x: Images.Mobile2x[ safeLocale ],

			// @ts-expect-error: We're picking images dynamically based on locale,
			// but we use 'en' as a guaranteed fallback
			desktop: Images.Desktop[ safeLocale ],

			// @ts-expect-error: We're picking images dynamically based on locale,
			// but we use 'en' as a guaranteed fallback
			desktop2x: Images.Desktop2x[ safeLocale ],
		};
	}, [ locale ] );
};

const Banner: React.FC = () => {
	const translate = useTranslate();
	const { desktop, desktop2x, mobile, mobile2x } = useBannerImages();

	return (
		<div className="intro-pricing-banner">
			<picture className="intro-pricing-banner__image">
				<source media="(max-width: 679px)" srcSet={ `${ mobile } 535w, ${ mobile2x } 1070w` } />
				<source media="(min-width: 680px)" srcSet={ `${ desktop } 1040w, ${ desktop2x } 2080w` } />
				<img
					alt={
						translate(
							'Get the perfect Jetpack for your site with %(percent)d%% off the first term. *Try it risk free with our %(days)d-day money-back guarantee.',
							{
								args: { percent: 40, days: 14 },
							}
						) as string
					}
					src={ desktop }
				/>
			</picture>
		</div>
	);
};

export default Banner;
