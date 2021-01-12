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
		<div className="new-year-2021-sale-banner">
			<picture className="new-year-2021-sale-banner__image">
				<source media="(max-width: 679px)" srcSet={ `${ mobile } 375w, ${ mobile2x } 750w` } />
				<source media="(min-width: 680px)" srcSet={ `${ desktop } 1080w, ${ desktop2x } 2160w` } />
				<img
					alt={ translate(
						'New Year 2021 sale! Save %(percent)d%% at checkout with code %(code)s through January 18',
						{
							args: { percent: 40, code: 'NEWPACK' },
						}
					) }
					src={ desktop }
				/>
			</picture>
		</div>
	);
};

export default Banner;
