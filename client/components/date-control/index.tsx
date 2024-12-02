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
	shortcutList,
	overlay,
	// Temporary prop to enable new date filtering UI.
	isNewDateFilteringEnabled = false,
}: DateControlProps ) => {
	const moment = useLocalizedMoment();
	const siteToday = useMomentSiteZone();

	const getShortcutForRange = () => {
		// Search the shortcut array for something matching the current date range.
		// Returns shortcut or null;
		const today = siteToday.format( 'YYYY-MM-DD' );
		const yesterday = siteToday.clone().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );
		const shortcut = shortcutList.find( ( element ) => {
			if (
				yesterday === dateRange.chartEnd &&
				dateRange.daysInRange === element.range + 1 &&
				element.id === 'yesterday'
			) {
				return element;
			}
			if ( today === dateRange.chartEnd && dateRange.daysInRange === element.range + 1 ) {
				return element;
			}
			return null;
		} );
		return shortcut;
	};

	const getButtonLabel = () => {
		// Test for a shortcut match.
		const shortcut = getShortcutForRange();
		if ( shortcut ) {
			return shortcut.label;
		}

		// Generate a full date range for the label.
		const localizedStartDate = moment( dateRange.chartStart );
		const localizedEndDate = moment( dateRange.chartEnd );

		// If it's the same day, show single date.
		if ( localizedStartDate.isSame( localizedEndDate, 'day' ) ) {
			return localizedStartDate.isSame( moment(), 'year' )
				? localizedStartDate.format( 'MMM D' )
				: localizedStartDate.format( 'll' );
		}

		if ( localizedStartDate.year() === localizedEndDate.year() ) {
			return `${ localizedStartDate.format( 'MMM D' ) } - ${ localizedEndDate.format( `MMM D` ) }${
				localizedStartDate.isSame( moment(), 'year' ) ? '' : localizedEndDate.format( ', YYYY' ) // Only append year if it's not the current year.
			}`;
		}

		return `${ localizedStartDate.format( 'll' ) } - ${ localizedEndDate.format( 'll' ) }`;
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<DateRange
				selectedStartDate={ moment( dateRange.chartStart ) }
				selectedEndDate={ moment( dateRange.chartEnd ) }
				lastSelectableDate={ siteToday }
				firstSelectableDate={ moment( '2010-01-01' ) }
				onDateCommit={ ( startDate: Moment, endDate: Moment ) =>
					startDate && endDate && onApplyButtonClick( startDate, endDate )
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
				onShortcutClick={ onShortcutClick }
				isNewDateFilteringEnabled={ isNewDateFilteringEnabled }
				trackExternalDateChanges
			/>
		</div>
	);
};

export { DateControl as default, DateControl, COMPONENT_CLASS_NAME };
