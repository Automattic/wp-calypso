import { TZDate } from '@date-fns/tz';
import {
	__experimentalText as Text,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { RangeCalendar } from '@wordpress/ui';
import { startOfMonth, subMonths } from 'date-fns';
import { useState } from 'react';
import { formatSiteYmd, parseYmdLocal } from '../../utils/datetime';
import { ButtonStack } from '../button-stack';
import { DateInputs } from './date-inputs';
import { PresetsListbox } from './presets-listbox';
import { computePresetRange, getActivePresetId, PresetId, presetDefs } from './utils';

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
	timezoneString?: string;
	onChange: ( next: { start: Date; end: Date } ) => void;
	onClose?: () => void;
	compositeActiveId: string | null;
	setCompositeActiveId: ( id: string | null ) => void;
	today: Date;
	todayStr: string;
	mobileLabelId: string;
	desktopLabelId: string;
	defaultFallbackPreset?: PresetId;
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
		timezoneString,
		onChange,
		onClose,
		compositeActiveId,
		setCompositeActiveId,
		today,
		todayStr,
		mobileLabelId,
		desktopLabelId,
		defaultFallbackPreset = 'last-7-days',
	} = props;

	// Avoid passing invalid or empty time zones to Intl consumers
	const isValidIanaTimeZone = ( timeZone?: string ): timeZone is string => {
		if ( ! timeZone ) {
			return false;
		}
		try {
			// Will throw for invalid IANA identifiers (including empty strings)
			Intl.DateTimeFormat( 'en-US', { timeZone: timeZone } );
			return true;
		} catch ( _e ) {
			return false;
		}
	};

	const timeZoneForCalendar = isValidIanaTimeZone( timezoneString ) ? timezoneString : undefined;
	const [ isTyping, setIsTyping ] = useState( false );
	const [ inputsVersion, setInputsVersion ] = useState( 0 );

	const clear = () => {
		setFromDraft( undefined );
		setToDraft( undefined );
		setFromStr( '' );
		setToStr( '' );
		setIsTyping( false );
		// Force controlled inputs to remount so any internal buffers are reset
		setInputsVersion( ( version ) => version + 1 );
	};

	const canDefaultApply = ! fromDraft && ! toDraft && ! fromStr && ! toStr && ! isTyping;
	const defaultPresetLabel =
		presetDefs.find( ( p ) => p.id === defaultFallbackPreset )?.label || __( 'default range' );

	const apply = () => {
		if ( fromDraft && toDraft ) {
			const [ startPoint, endPoint ] =
				fromDraft <= toDraft ? [ fromDraft, toDraft ] : [ toDraft, fromDraft ];
			onChange( { start: startPoint, end: endPoint } );
			onClose?.();
			return;
		}
		if ( canDefaultApply ) {
			const range = computePresetRange( defaultFallbackPreset, today );
			if ( range ) {
				onChange( { start: range.from, end: range.to } );
				onClose?.();
			}
		}
	};

	const setPreset = ( id: PresetId ) => {
		const range = computePresetRange( id, today );
		if ( ! range ) {
			return;
		}
		setFromDraft( range.from );
		setToDraft( range.to );
		setFromStr( formatSiteYmd( range.from ) );
		setToStr( formatSiteYmd( range.to ) );
		onChange( { start: range.from, end: range.to } );
		onClose?.();
	};

	const activePresetId: PresetId | undefined = ( () => {
		const preset = getActivePresetId( fromDraft, toDraft, today );
		if ( preset ) {
			return preset;
		}
		// Only mark "custom" when both dates are present and do not match a known preset
		if ( fromDraft && toDraft ) {
			return 'custom';
		}
		// When cleared or incomplete, highlight nothing
		return undefined;
	} )();

	// `today` and drafts already carry site calendar days, not instants.
	const siteMonthStart = startOfMonth( today );
	const prevMonthStart = subMonths( siteMonthStart, 1 );

	// Build calendar month refs
	const inCalendarTimeZone = ( d: Date ) =>
		timeZoneForCalendar
			? new TZDate( d.getFullYear(), d.getMonth(), d.getDate(), timeZoneForCalendar )
			: d;

	const defaultMonth = showTwoMonths
		? inCalendarTimeZone( prevMonthStart )
		: inCalendarTimeZone( siteMonthStart );

	const endMonth = inCalendarTimeZone( siteMonthStart );

	// Use TZDate for calendar selection when a valid IANA time zone is available
	const value = {
		from: fromDraft ? inCalendarTimeZone( fromDraft ) : undefined,
		to: toDraft ? inCalendarTimeZone( toDraft ) : undefined,
	};

	// `today` is a site day held as a browser-local midnight, but the calendar matches days in
	// `timeZoneForCalendar`, so rebuild it as that day's midnight in the site zone.
	const disabledMatcher = {
		after: inCalendarTimeZone( today ),
	};

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
						key={ `inputs-${ inputsVersion }-mobile` }
						fromStr={ fromStr }
						toStr={ toStr }
						onFromChange={ ( value ) => {
							setFromStr( value );
							const parsed = value ? parseYmdLocal( value ) || undefined : undefined;
							setFromDraft( parsed );
							setIsTyping( Boolean( value || toStr ) );
						} }
						onToChange={ ( value ) => {
							setToStr( value );
							const parsed = value ? parseYmdLocal( value ) || undefined : undefined;
							setToDraft( parsed );
							setIsTyping( Boolean( fromStr || value ) );
						} }
						todayStr={ todayStr }
						onFromFocus={ () => {
							setIsTyping( true );
						} }
						onToFocus={ () => {
							setIsTyping( true );
						} }
						onFromBlur={ () => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
						} }
						onToBlur={ () => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
						} }
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
						key={ `inputs-${ inputsVersion }-desktop` }
						fromStr={ fromStr }
						toStr={ toStr }
						onFromChange={ ( value ) => {
							setFromStr( value );
							const parsed = value ? parseYmdLocal( value ) || undefined : undefined;
							setFromDraft( parsed );
							setIsTyping( Boolean( value || toStr ) );
						} }
						onToChange={ ( value ) => {
							setToStr( value );
							const parsed = value ? parseYmdLocal( value ) || undefined : undefined;
							setToDraft( parsed );
							setIsTyping( Boolean( fromStr || value ) );
						} }
						todayStr={ todayStr }
						onFromFocus={ () => {
							setIsTyping( true );
						} }
						onToFocus={ () => {
							setIsTyping( true );
						} }
						onFromBlur={ () => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
						} }
						onToBlur={ () => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
						} }
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
					<RangeCalendar
						timeZone={ timeZoneForCalendar }
						numberOfMonths={ showTwoMonths ? 2 : 1 }
						defaultMonth={ defaultMonth }
						endMonth={ endMonth }
						disabled={ disabledMatcher }
						excludeDisabled
						required
						value={ value }
						onValueChange={ ( range ) => {
							// A click after a complete range starts a new one with no end, so `to` must be cleared too.
							// Preserve the calendar's zoned day before returning browser-local day carriers.
							const from = range?.from
								? new Date( range.from.getFullYear(), range.from.getMonth(), range.from.getDate() )
								: undefined;
							const to = range?.to
								? new Date( range.to.getFullYear(), range.to.getMonth(), range.to.getDate() )
								: undefined;
							setFromDraft( from );
							setToDraft( to );
							setFromStr( from ? formatSiteYmd( from ) : '' );
							setToStr( to ? formatSiteYmd( to ) : '' );
							setIsTyping( false );
						} }
					/>
				</div>
			</HStack>

			<ButtonStack as="div" justify="flex-end">
				<Button variant="secondary" onClick={ clear }>
					{ __( 'Clear' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ apply }
					disabled={ ( ! fromDraft || ! toDraft ) && ! canDefaultApply }
					aria-label={
						/* translators: %s is the preset label, e.g. 'Last 30 days' */
						canDefaultApply ? sprintf( __( 'Apply %s' ), defaultPresetLabel ) : __( 'Apply' )
					}
				>
					{
						/* translators: %s is the preset label, e.g. 'Last 30 days' */
						canDefaultApply ? sprintf( __( 'Apply %s' ), defaultPresetLabel ) : __( 'Apply' )
					}
				</Button>
			</ButtonStack>
		</VStack>
	);
}
