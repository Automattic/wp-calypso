/**
 * External dependencies
 */
import { Moment } from 'moment';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, MutableRefObject } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import DateRange from 'components/date-range';
import { ActivityCount } from '../types';
import { useLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';

interface Props {
	activityCounts: ActivityCount[];
	onClick: () => void;
	onSelectedDatesChange: (
		selectedStartDate: Moment | null,
		selectedEndDate: Moment | null
	) => void;
	selectedEndDate: Moment | null;
	selectedStartDate: Moment | null;
	visible: boolean;
}

const BackupsDateRangeSelector: FunctionComponent< Props > = ( {
	activityCounts,
	selectedEndDate,
	selectedStartDate,
	visible,
	onSelectedDatesChange,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const renderButtonText = (
		startDate: Date | Moment | null | undefined,
		endDate: Date | Moment | null | undefined
	) => {
		if ( selectedStartDate === null && selectedEndDate === null ) {
			return translate( 'Date range' );
		}
		return translate( '%(startDate)s - %(endDate)s', {
			args: {
				startDate: startDate
					? moment( startDate ).format( 'L' )
					: moment( activityCounts[ 0 ].date ).format( 'L ' ),
				endDate: endDate
					? moment( endDate ).format( 'L' )
					: moment( activityCounts[ activityCounts.length - 1 ].date ).format( 'L ' ),
			},
		} );
	};

	const renderTrigger = ( {
		buttonRef,
		endDate,
		onTriggerClick,
		startDate,
	}: {
		onTriggerClick: () => void;
		onClearClick: () => void;
		buttonRef: MutableRefObject< null >;
		startDate: Date | Moment | null | undefined;
		endDate: Date | Moment | null | undefined;
	} ) => (
		<Button
			borderless
			className="backup-date-range-selector"
			ref={ buttonRef }
			onClick={ onTriggerClick }
		>
			{ renderButtonText( startDate, endDate ) }
		</Button>
	);

	// TODO: This is a timezone mess. The DateRange operates with an un-modified moment. Everything going in and out needs to be carefully transformed.
	return (
		<DateRange
			renderTrigger={ renderTrigger }
			onDateCommit={ onSelectedDatesChange }
			firstSelectableDate={ moment( activityCounts[ 0 ].date ) }
			lastSelectableDate={ moment( activityCounts[ activityCounts.length - 1 ].date ) }
		/>
	);
};

export default BackupsDateRangeSelector;
