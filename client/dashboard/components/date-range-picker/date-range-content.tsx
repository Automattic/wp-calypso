import { DateRangeCalendar } from '@automattic/ui';
import {
	__experimentalText as Text,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { format, startOfDay, addHours } from 'date-fns';
import { DateInputs } from './date-inputs';
import { PresetsListbox } from './presets-listbox';
import { computePresetRange, getActivePresetId, PresetId, getTimezoneAwareDate } from './utils';

type DateRangeContentProps = {
	isSmall: boolean;
	showTwoMonths?: boolean;
	fromDraft?: Date;
	toDraft?: Date;
	fromStr: string;
	toStr: string;
	setFromDraft: ( date?: Date ) => void;
	setToDraft: ( date?: Date ) => void;
	setFromStr: ( string: string ) => void;
	setToStr: ( string: string ) => void;
	onChange: ( next: { start: Date; end: Date } ) => void;
	onClose?: () => void;
	timezoneString?: string;
	gmtOffset?: number;
	compositeActiveId: string | null;
	setCompositeActiveId: ( id: string | null ) => void;
	today: Date;
	todayStr: string;
	mobileLabelId: string;
	desktopLabelId: string;
	disableFuture?: boolean;
};

export function DateRangeContent( props: DateRangeContentProps ) {
	const {
		isSmall,
		showTwoMonths = false,
		fromDraft,
		toDraft,
		fromStr,
		toStr,
		setFromDraft,
		setToDraft,
		setFromStr,
		setToStr,
		onChange,
		onClose,
		timezoneString,
		gmtOffset,
		compositeActiveId,
		setCompositeActiveId,
		today,
		todayStr,
		mobileLabelId,
		desktopLabelId,
		disableFuture = true,
	} = props;

	const clear = () => {
		setFromDraft( undefined );
		setToDraft( undefined );
		setFromStr( '' );
		setToStr( '' );
	};

	const apply = () => {
		if ( ! fromDraft || ! toDraft ) {
			return;
		}
		const [ startPoint, endPoint ] =
			fromDraft <= toDraft ? [ fromDraft, toDraft ] : [ toDraft, fromDraft ];
		onChange( { start: startPoint, end: endPoint } );
		onClose?.();
	};

	const setPreset = ( id: PresetId ) => {
		// For presets, use site timezone, allowing users to access logs from the site's current day
		let presetToday: Date;

		if ( timezoneString ) {
			const now = new Date();
			const siteTime = new Intl.DateTimeFormat( 'en-US', {
				timeZone: timezoneString,
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
			} ).formatToParts( now );

			const year = parseInt( siteTime.find( ( p ) => p.type === 'year' )?.value || '0' );
			const month = parseInt( siteTime.find( ( p ) => p.type === 'month' )?.value || '0' ) - 1; // Month is 0-indexed
			const day = parseInt( siteTime.find( ( p ) => p.type === 'day' )?.value || '0' );

			presetToday = startOfDay( new Date( year, month, day ) );
		} else if ( typeof gmtOffset === 'number' ) {
			// Use GMT offset if no timezone string
			const now = new Date();
			presetToday = startOfDay( addHours( now, gmtOffset ) );
		} else {
			// Fallback to UTC (default behavior)
			const utcNow = new Date();
			presetToday = startOfDay(
				new Date( Date.UTC( utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() ) )
			);
		}

		const range = computePresetRange( id, presetToday );
		if ( ! range ) {
			return;
		}
		setFromDraft( range.from );
		setToDraft( range.to );
		// Use UTC formatting without timezone conversion for consistency
		setFromStr( format( range.from, 'yyyy-MM-dd' ) );
		setToStr( format( range.to, 'yyyy-MM-dd' ) );
		onChange( { start: range.from, end: range.to } );
		onClose?.();
	};

	// Calculate timezone-aware today for preset detection
	const timezoneAwareToday = getTimezoneAwareDate( today, timezoneString, gmtOffset );

	const activePresetId = getActivePresetId(
		fromDraft,
		toDraft,
		timezoneAwareToday,
		timezoneString,
		gmtOffset
	);

	const defaultMonth = showTwoMonths
		? new Date( today.getFullYear(), today.getMonth() - 1, 1 )
		: today;
	const endMonth = new Date( today.getFullYear(), today.getMonth(), 1 );

	const selected = { from: fromDraft ?? undefined, to: toDraft ?? undefined };

	return (
		<VStack as="div" spacing={ 3 } style={ { padding: 12 } }>
			<Text as="div" weight={ 600 } align="center" size="smallTitle">
				{ __( 'Date Range' ) }
			</Text>

			{ isSmall ? (
				<VStack as="div" spacing={ 2 }>
					<PresetsListbox
						labelId={ mobileLabelId }
						activePresetId={ activePresetId }
						onSelect={ setPreset }
						compositeActiveId={ compositeActiveId }
						setCompositeActiveId={ setCompositeActiveId }
					/>

					<DateInputs
						fromStr={ fromStr }
						toStr={ toStr }
						onFromChange={ ( value ) => setFromStr( value ) }
						onToChange={ ( value ) => setToStr( value ) }
						todayStr={ todayStr }
						stack
						fromStyle={ { minWidth: 140 } }
						toStyle={ { minWidth: 140 } }
					/>
				</VStack>
			) : (
				<HStack
					as="div"
					spacing={ 4 }
					justify="flex-end"
					className="daterange-inputs"
					wrap={ false }
					style={ { width: '100%' } }
				>
					<DateInputs
						fromStr={ fromStr }
						toStr={ toStr }
						onFromChange={ ( v ) => setFromStr( v ) }
						onToChange={ ( v ) => setToStr( v ) }
						todayStr={ todayStr }
						fromStyle={ { minWidth: 220, flex: '0 0 auto' } }
						toStyle={ { minWidth: 220, flex: '0 0 auto' } }
						justify="flex-end"
						containerStyle={ { width: '100%' } }
					/>
				</HStack>
			) }

			<HStack as="div" spacing={ 4 } justify="flex-start" className="daterange-body" wrap={ false }>
				{ ! isSmall && (
					<PresetsListbox
						labelId={ desktopLabelId }
						activePresetId={ activePresetId }
						onSelect={ setPreset }
						compositeActiveId={ compositeActiveId }
						setCompositeActiveId={ setCompositeActiveId }
					/>
				) }

				<div className="daterange-calendar">
					<DateRangeCalendar
						numberOfMonths={ isSmall ? 1 : 2 }
						defaultMonth={ defaultMonth }
						endMonth={ endMonth }
						disabled={ disableFuture ? { after: today } : undefined }
						excludeDisabled
						selected={ selected }
						onSelect={ ( range ) => {
							const toNative = ( d?: Date ) => ( d ? new Date( d.getTime() ) : undefined );
							if ( range?.from ) {
								const from = toNative( range.from );
								setFromDraft( from );
								if ( from ) {
									// Use UTC formatting without timezone conversion for consistency
									setFromStr( format( from, 'yyyy-MM-dd' ) );
								}
							}
							if ( range?.to ) {
								const to = toNative( range.to );
								setToDraft( to );
								if ( to ) {
									// Use UTC formatting without timezone conversion for consistency
									setToStr( format( to, 'yyyy-MM-dd' ) );
								}
							}
						} }
					/>
				</div>
			</HStack>

			<HStack as="div" spacing={ 2 } justify="flex-end">
				<Button variant="secondary" onClick={ clear }>
					{ __( 'Clear' ) }
				</Button>
				<Button variant="primary" onClick={ apply } disabled={ ! fromDraft || ! toDraft }>
					{ __( 'Apply' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
