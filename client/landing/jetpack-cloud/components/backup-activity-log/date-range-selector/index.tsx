/**
 * External dependencies
 */
import { Moment } from 'moment';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import DateRange from 'components/date-range';

interface Props {
	newestDate: Moment;
	oldestDate: Moment;
	onDateCommit: ( selectedStartDate: Moment | null, selectedEndDate: Moment | null ) => void;
	selectedEndDate: Moment | null;
	selectedStartDate: Moment | null;
}

const BackupsDateRangeSelector: FunctionComponent< Props > = ( {
	oldestDate,
	newestDate,
	onDateCommit,
	selectedEndDate,
	selectedStartDate,
} ) => {
	const translate = useTranslate();

	const renderTrigger = ( { buttonRef, onTriggerClick } ) => (
		<Button ref={ buttonRef } onClick={ onTriggerClick }>
			{ translate( 'Date range' ) }
		</Button>
	);

	return (
		<DateRange
			firstSelectableDate={ oldestDate }
			lastSelectableDate={ newestDate }
			onDateCommit={ onDateCommit }
			renderTrigger={ renderTrigger }
			selectedEndDate={ selectedEndDate }
			selectedStartDate={ selectedStartDate }
		/>
	);
};

export default BackupsDateRangeSelector;
