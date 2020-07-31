/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { TimeMismatchWarning } from 'blocks/time-mismatch-warning';
import { useLocalizedMoment } from 'components/localized-moment';

const TimeMismatchWarningExample = () => {
	const moment = useLocalizedMoment();
	const offsetTime = moment().add( 1, 'hour' );
	return <TimeMismatchWarning applySiteOffset={ () => offsetTime } />;
};
TimeMismatchWarningExample.displayName = 'TimeMismatchWarning';

export default TimeMismatchWarningExample;
