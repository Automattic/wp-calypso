import { Button, Tooltip } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import { Moment } from 'moment';
import { RefObject } from 'react';
import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useMomentSiteZone from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { DateControlProps } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'date-control';

const DateControl = ( {
	onApplyButtonClick,
	onShortcutClick,
	onDateControlClick,
	tooltip,
	dateRange,
	overlay,
	shortcutList,
}: DateControlProps ) => {
	const moment = useLocalizedMoment();
	const siteToday = useMomentSiteZone();

	const getButtonLabel = () => {
		const localizedStartDate = moment( dateRange.chartStart );
		const localizedEndDate = moment( dateRange.chartEnd );

		// If it's the same day, show single date.
		if ( localizedStartDate.isSame( localizedEndDate, 'day' ) ) {
			return localizedStartDate.format( 'LL' );
		}

		// Only show year for the second date.
		if (
			localizedStartDate.year() === localizedEndDate.year() &&
			localizedStartDate.isSame( moment(), 'year' )
		) {
			return `${ localizedStartDate.format( 'MMM D' ) } - ${ localizedEndDate.format(
				`MMM D, YYYY`
			) }`;
		}

		return `${ localizedStartDate.format( 'll' ) } - ${ localizedEndDate.format( 'll' ) }`;
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<DateRange
				selectedStartDate={ moment( dateRange.chartStart ) }
				selectedEndDate={ moment( dateRange.chartEnd ) }
				selectedShortcutId={ dateRange.shortcutId }
				lastSelectableDate={ siteToday }
				firstSelectableDate={ moment( '2010-01-01' ) }
				onDateCommit={ ( startDate: Moment, endDate: Moment, selectedShortcutId: string ) =>
					startDate && endDate && onApplyButtonClick( startDate, endDate, selectedShortcutId )
				}
				renderTrigger={ ( {
					onTriggerClick,
					buttonRef,
				}: {
					onTriggerClick: () => void;
					buttonRef: RefObject< typeof Button >;
				} ) => {
					return (
						<Tooltip text={ tooltip } placement="bottom-end">
							<Button
								onClick={ () => {
									onDateControlClick?.();
									onTriggerClick();
								} }
								ref={ buttonRef }
							>
								{ getButtonLabel() }
								<Icon className="gridicon" icon={ calendar } />
							</Button>
						</Tooltip>
					);
				} }
				rootClass="date-control-picker"
				overlay={ overlay }
				displayShortcuts
				useArrowNavigation
				customTitle="Date Range"
				focusedMonth={ moment( dateRange.chartEnd ).toDate() }
				shortcutList={ shortcutList }
				onShortcutClick={ onShortcutClick }
				trackExternalDateChanges
			/>
		</div>
	);
};

export { DateControl as default, DateControl, COMPONENT_CLASS_NAME };
