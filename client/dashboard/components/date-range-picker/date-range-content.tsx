import { DateRangeCalendar, TZDate } from '@automattic/ui';
import {
	__experimentalText as Text,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { startOfMonth, subMonths } from 'date-fns';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { formatYmd, parseYmdLocal } from '../../utils/datetime';
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
	gmtOffset?: number;
	onChange: ( next: { start: Date; end: Date } ) => void;
	onClose?: () => void;
	compositeActiveId: string | null;
	setCompositeActiveId: ( id: string | null ) => void;
	today: Date;
	todayStr: string;
	mobileLabelId: string;
	desktopLabelId: string;
	disableFuture?: boolean;
	defaultFallbackPreset?: PresetId;
	inputsProps?: {
		onStartFocus?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
		onEndFocus?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
		onStartBlur?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
		onEndBlur?: ( e: React.FocusEvent< HTMLInputElement > ) => void;
	};
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
		gmtOffset,
		onChange,
		onClose,
		compositeActiveId,
		setCompositeActiveId,
		today,
		todayStr,
		mobileLabelId,
		desktopLabelId,
		disableFuture = true,
		defaultFallbackPreset = 'last-7-days',
		inputsProps,
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
		setFromStr( formatYmd( range.from, timezoneString, gmtOffset ) );
		setToStr( formatYmd( range.to, timezoneString, gmtOffset ) );
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

	// Site “today” as a site-day Date
	const siteToday =
		parseYmdLocal( formatYmd( today, timezoneString, gmtOffset ) ) ??
		new Date( today.getFullYear(), today.getMonth(), today.getDate() );

	// Month anchors in site time
	const siteMonthStart = startOfMonth( siteToday );
	const prevMonthStart = subMonths( siteMonthStart, 1 );

	// Build calendar month refs
	const makeTZMonthFromDate = ( d: Date ) =>
		timeZoneForCalendar
			? new TZDate( Date.UTC( d.getFullYear(), d.getMonth(), 1, 12 ), timeZoneForCalendar )
			: new Date( d.getFullYear(), d.getMonth(), 1 );

	const defaultMonth = showTwoMonths
		? makeTZMonthFromDate( prevMonthStart )
		: makeTZMonthFromDate( siteMonthStart );

	const endMonth = makeTZMonthFromDate( siteMonthStart );

	// Use TZDate for calendar selection when a valid IANA time zone is available
	const selected =
		timeZoneForCalendar && ( fromDraft || toDraft )
			? {
					from: fromDraft ? new TZDate( +fromDraft, timeZoneForCalendar ) : undefined,
					to: toDraft ? new TZDate( +toDraft, timeZoneForCalendar ) : undefined,
			  }
			: { from: fromDraft ?? undefined, to: toDraft ?? undefined };

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
						onFromFocus={ ( e ) => {
							setIsTyping( true );
							inputsProps?.onStartFocus?.( e );
						} }
						onToFocus={ ( e ) => {
							setIsTyping( true );
							inputsProps?.onEndFocus?.( e );
						} }
						onFromBlur={ ( e ) => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
							inputsProps?.onStartBlur?.( e );
						} }
						onToBlur={ ( e ) => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
							inputsProps?.onEndBlur?.( e );
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
						onFromFocus={ ( e ) => {
							setIsTyping( true );
							inputsProps?.onStartFocus?.( e );
						} }
						onToFocus={ ( e ) => {
							setIsTyping( true );
							inputsProps?.onEndFocus?.( e );
						} }
						onFromBlur={ ( e ) => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
							inputsProps?.onStartBlur?.( e );
						} }
						onToBlur={ ( e ) => {
							if ( ! fromStr && ! toStr ) {
								setIsTyping( false );
							}
							inputsProps?.onEndBlur?.( e );
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
					<DateRangeCalendar
						timeZone={ timeZoneForCalendar }
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
									setFromStr( formatYmd( from, timezoneString, gmtOffset ) );
								}
							}
							if ( range?.to ) {
								const to = toNative( range.to );
								setToDraft( to );
								if ( to ) {
									setToStr( formatYmd( to, timezoneString, gmtOffset ) );
								}
							}
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
