import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import { useState, useRef } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DateControlPickerDate from './stats-date-control-picker-date';
import DateControlPickerShortcuts from './stats-date-control-picker-shortcuts';
import { DateControlPickerProps, DateControlPickerShortcut } from './types';
import './style.scss';

const DateControlPicker = ( {
	buttonLabel,
	dateRange,
	shortcutList,
	selectedShortcut,
	onShortcut,
	onApply,
	overlay,
	onGatedHandler,
}: DateControlPickerProps ) => {
	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// Pull dates from provided range.
	const [ inputStartDate, setInputStartDate ] = useState(
		moment( dateRange.chartStart ).format( 'YYYY-MM-DD' )
	);
	const [ inputEndDate, setInputEndDate ] = useState(
		moment( dateRange.chartEnd ).format( 'YYYY-MM-DD' )
	);
	const infoReferenceElement = useRef( null );
	const [ popoverOpened, togglePopoverOpened ] = useState( false );

	const changeStartDate = ( value: string ) => {
		setInputStartDate( value );
	};

	const changeEndDate = ( value: string ) => {
		setInputEndDate( value );
	};

	const updateLocalStateFromShortcut = ( shortcut: DateControlPickerShortcut ) => {
		const endDate =
			shortcut.offset === 0
				? moment().format( 'YYYY-MM-DD' )
				: moment().subtract( shortcut.offset, 'days' ).format( 'YYYY-MM-DD' );

		const startDate =
			shortcut.range === 0
				? endDate
				: moment( endDate ).subtract( shortcut.range, 'days' ).format( 'YYYY-MM-DD' );

		setInputStartDate( startDate );
		setInputEndDate( endDate );
	};

	const handleOnApply = () => {
		togglePopoverOpened( false );
		onApply( inputStartDate, inputEndDate );
	};

	const handleOnCancel = () => {
		togglePopoverOpened( false );
	};

	const handleShortcutSelected = ( shortcut: DateControlPickerShortcut ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		if ( shortcut.isGated && onGatedHandler ) {
			const events = [
				{ name: `${ event_from }_stats_date_picker_shortcut_${ shortcut.id }_gated_clicked` },
				{
					name: 'jetpack_stats_upsell_clicked',
					params: { stat_type: shortcut.statType, source: event_from },
				},
			];
			return onGatedHandler( events, event_from, shortcut.statType );
		}

		togglePopoverOpened( false );
		updateLocalStateFromShortcut( shortcut );
		onShortcut( shortcut );
	};

	const togglePopoverVisibility = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';

		if ( ! popoverOpened ) {
			// record an event for opening the date picker
			recordTracksEvent( `${ event_from }_stats_date_picker_opened` );
		}

		togglePopoverOpened( ! popoverOpened );
	};

	return (
		<div className="stats-date-control-picker">
			<Button onClick={ togglePopoverVisibility } ref={ infoReferenceElement }>
				{ buttonLabel }
				<Icon className="gridicon" icon={ calendar } />
			</Button>
			<Popover
				position="bottom"
				context={ infoReferenceElement?.current }
				isVisible={ popoverOpened }
				className="stats-date-control-picker__popover-wrapper"
				onClose={ () => togglePopoverOpened( false ) }
			>
				<div className="stats-date-control-picker__popover-content">
					<DateControlPickerShortcuts
						shortcutList={ shortcutList }
						currentShortcut={ selectedShortcut }
						onClick={ handleShortcutSelected }
					/>
					<DateControlPickerDate
						startDate={ inputStartDate }
						endDate={ inputEndDate }
						onStartChange={ changeStartDate }
						onEndChange={ changeEndDate }
						onApply={ handleOnApply }
						onCancel={ handleOnCancel }
						overlay={ overlay }
					/>
				</div>
			</Popover>
		</div>
	);
};

export default DateControlPicker;
