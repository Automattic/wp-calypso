/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Style dependencies
 */
import desktopBanner from './new-year-banner.png';
import desktopBannerRetina from './new-year-banner-2x.png';
import mobileBanner from './new-year-banner_mobile.png';
import mobileBannerRetina from './new-year-banner_mobile-2x.png';

const NewYear2021SaleBanner: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="new-year-2021-sale-banner">
			<picture className="new-year-2021-sale-banner__image">
				<source
					media="(max-width: 679px)"
					srcSet={ `${ mobileBanner } 375w, ${ mobileBannerRetina } 750w` }
				/>
				<source
					media="(min-width: 680px)"
					srcSet={ `${ desktopBanner } 1080w, ${ desktopBannerRetina } 2160w` }
				/>
				<img
					alt={ translate(
						'New Year 2021 sale! Save %(percent)d%% at checkout with code %(code)s through January 18',
						{
							args: { percent: 40, code: 'NEWPACK' },
						}
					) }
					src={ desktopBanner }
				/>
			</picture>
		</div>
	);
};

export default NewYear2021SaleBanner;
