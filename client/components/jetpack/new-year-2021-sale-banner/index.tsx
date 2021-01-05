/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import desktopBanner from './new-year-banner.png';
import desktopBannerRetina from './new-year-banner-2x.png';
import mobileBanner from './new-year-banner_mobile.png';
import mobileBannerRetina from './new-year-banner_mobile-2x.png';

const Banner: React.FC = () => {
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

// Something of an experiment here; maybe this is something we can adapt for future promos?
const TimeWindowWrapper: React.FC< TimeWindowProps > = ( { start, end, children } ) => {
	const moment = useLocalizedMoment();

	// '[)': The checked range includes the 'start' value,
	// but ends just before the 'end' value
	const showPromo = moment().isBetween( start, end, 'second', '[)' );

	return showPromo ? <>{ children }</> : null;
};

type TimeWindowProps = {
	start: Moment;
	end: Moment;
};

const TimeGatedNewYear2021SaleBanner: React.FC< Props > = ( { urlQueryArgs } ) => {
	const paramValue = urlQueryArgs?.[ 'newpack' ];

	const moment = useLocalizedMoment();
	if ( paramValue === undefined ) {
		// Start at midnight UTC on Jan 1,
		// and continue until 23:59:59 UTC on Jan 18
		const start = moment.utc( '2021-01-01' );
		const end = moment.utc( '2021-01-19' );

		return (
			<TimeWindowWrapper start={ start } end={ end }>
				<Banner />
			</TimeWindowWrapper>
		);
	}

	if ( paramValue === '0' || paramValue === 'false' ) {
		return null;
	}

	// Show the promo if the `newpack` arg is present,
	// as long as the arg value isn't '0' or 'false'.
	return <Banner />;
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default TimeGatedNewYear2021SaleBanner;
