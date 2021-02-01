/**
 * External dependencies
 */
import { Moment } from 'moment';
import React from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Banner from './banner';

/**
 * Style dependencies
 */
import './style.scss';

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

const TimeGatedFreshStart2021SaleBanner: React.FC< Props > = ( { urlQueryArgs } ) => {
	const paramValue = urlQueryArgs?.[ 'freshstart' ];
	const moment = useLocalizedMoment();

	if ( ! paramValue ) {
		// Start at midnight UTC on Feb 1,
		// and continue until 23:59:59 UTC on Feb 14
		const start = moment.utc( '2021-02-01' );
		const end = moment.utc( '2021-02-15' );

		return (
			<TimeWindowWrapper start={ start } end={ end }>
				<Banner />
			</TimeWindowWrapper>
		);
	}

	if ( paramValue === '0' || paramValue === 'false' ) {
		return null;
	}

	// Show the promo if the `freshstart` arg is present,
	// as long as the arg value isn't '0' or 'false'.
	return <Banner />;
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
};

export default TimeGatedFreshStart2021SaleBanner;
