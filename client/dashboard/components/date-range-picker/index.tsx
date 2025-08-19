import { DateRangeCalendar } from '@automattic/ui';
import {
	Dropdown,
	Tooltip,
	__experimentalText as Text,
	TextControl,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useMemo, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import { parseYmdLocal, formatLabel, formatYmd } from '../../utils/datetime';

import './style.scss';
type DateRangePickerProps = {
	start: Date;
	end: Date;
	onChange: ( next: { start: Date; end: Date } ) => void;
	timezoneString?: string;
	gmtOffset?: number;
};

export function DateRangePicker( {
	start,
	end,
	onChange,
	gmtOffset,
	timezoneString,
}: DateRangePickerProps ) {
	const locale = useLocale();
	const isSmall = useMediaQuery( '(max-width: 600px)' );

	const label = useMemo(
		() => formatLabel( start, end, locale, timezoneString, gmtOffset ),
		[ start, end, locale, timezoneString, gmtOffset ]
	);

	const [ fromDraft, setFromDraft ] = useState< Date | undefined >( () => start );
	const [ toDraft, setToDraft ] = useState< Date | undefined >( () => end );
	const [ fromStr, setFromStr ] = useState( () => formatYmd( start, timezoneString, gmtOffset ) );
	const [ toStr, setToStr ] = useState( () => formatYmd( end, timezoneString, gmtOffset ) );

	// Sync start/end into draft
	useEffect( () => {
		setFromDraft( start );
		setFromStr( formatYmd( start, timezoneString, gmtOffset ) );
	}, [ gmtOffset, start, timezoneString ] );

	useEffect( () => {
		setToDraft( end );
		setToStr( formatYmd( end, timezoneString, gmtOffset ) );
	}, [ gmtOffset, end, timezoneString ] );

	return (
		<div className="daterange-container">
			<Dropdown
				popoverProps={ { className: 'daterange-popover' } }
				renderToggle={ ( { onToggle, isOpen } ) => (
					<Tooltip text={ __( 'Select a date range' ) } placement="top">
						<div className="daterange-input__toggle">
							<Button
								type="button"
								variant="secondary"
								onClick={ onToggle }
								aria-haspopup="dialog"
								aria-expanded={ isOpen }
								aria-label={ sprintf(
									/* Translators: %s: date range label */
									__( 'Date range: %s. Activate to open calendar.' ),
									label
								) }
								className="daterange-input__field"
								style={ { justifyContent: 'space-between' } }
							>
								<span aria-hidden="true" className="daterange-input__text">
									{ label }
								</span>
								<Icon icon={ calendar } size={ 24 } style={ { marginRight: 8, paddingLeft: 4 } } />
							</Button>
						</div>
					</Tooltip>
				) }
				renderContent={ ( { onClose } ) => {
					const today = new Date();
					today.setHours( 0, 0, 0, 0 );

					// Helpers (site/browser local; inclusive ranges)
					const lastNDays = ( date: Date, n: number ) => ( {
						from: new Date( date.getFullYear(), date.getMonth(), date.getDate() - ( n - 1 ) ),
						to: date,
					} );
					const monthToDate = ( date: Date ) => ( {
						from: new Date( date.getFullYear(), date.getMonth(), 1 ),
						to: date,
					} );

					const yearToDate = ( date: Date ) => ( {
						from: new Date( date.getFullYear(), 0, 1 ),
						to: date,
					} );
					const lastTwelveMonths = ( date: Date ) => ( {
						from: new Date( date.getFullYear() - 1, date.getMonth(), date.getDate() + 1 ),
						to: date,
					} );
					const lastThreeYears = ( date: Date ) => ( {
						from: new Date( date.getFullYear() - 3, date.getMonth(), date.getDate() + 1 ),
						to: date,
					} );

					type PresetId =
						| 'today'
						| 'yesterday'
						| 'last-7-days'
						| 'last-30-days'
						| 'month-to-date'
						| 'last-12-months'
						| 'year-to-date'
						| 'last-3-years';

					const presetDefs = [
						{ id: 'today', label: __( 'Today' ) },
						{ id: 'yesterday', label: __( 'Yesterday' ) },
						{ id: 'last-7-days', label: __( 'Last 7 days' ) },
						{ id: 'last-30-days', label: __( 'Last 30 days' ) },
						{ id: 'month-to-date', label: __( 'Month to date' ) },
						{ id: 'last-12-months', label: __( 'Last 12 months' ) },
						{ id: 'year-to-date', label: __( 'Year to date' ) },
						{ id: 'last-3-years', label: __( 'Last 3 years' ) },
					] as const satisfies ReadonlyArray< { id: PresetId; label: string } >;

					const computePresetRange = ( preset: PresetId ) => {
						switch ( preset ) {
							case 'today':
								return { from: today, to: today };
							case 'yesterday':
								return {
									from: new Date( today.getFullYear(), today.getMonth(), today.getDate() - 1 ),
									to: new Date( today.getFullYear(), today.getMonth(), today.getDate() - 1 ),
								};
							case 'last-7-days':
								return lastNDays( today, 7 );
							case 'last-30-days':
								return lastNDays( today, 30 );
							case 'month-to-date':
								return monthToDate( today );
							case 'last-12-months':
								return lastTwelveMonths( today );
							case 'year-to-date':
								return yearToDate( today );
							case 'last-3-years':
								return lastThreeYears( today );
							default:
								return undefined;
						}
					};

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
						const [ a, b ] = fromDraft <= toDraft ? [ fromDraft, toDraft ] : [ toDraft, fromDraft ];
						onChange( { start: a, end: b } );
						onClose?.(); // We want the popover to close on clicking apply.
					};

					const setPreset = ( id: PresetId ) => {
						const range = computePresetRange( id );
						if ( ! range ) {
							return;
						}
						setFromDraft( range.from );
						setToDraft( range.to );
						setFromStr( formatYmd( range.from, timezoneString, gmtOffset ) );
						setToStr( formatYmd( range.to, timezoneString, gmtOffset ) );
						onChange( { start: range.from, end: range.to } );
						onClose?.(); // We want the popover to close on setting a preset.
					};

					const defaultMonth = isSmall
						? today
						: new Date( today.getFullYear(), today.getMonth() - 1, 1 );
					const endMonth = new Date( today.getFullYear(), today.getMonth(), 1 );

					return (
						<div style={ { padding: 12 } }>
							<Text
								as="div"
								weight={ 600 }
								align="center"
								size="smallTitle"
								style={ { marginBottom: 8 } }
							>
								{ __( 'Date Range' ) }
							</Text>

							{ isSmall ? (
								<>
									{ /* Presets on mobile first */ }
									<VStack
										as="div"
										spacing={ 1 }
										className="daterange-presets"
										style={ { marginBottom: 16 } }
									>
										<Text as="div" weight={ 600 }>
											{ __( 'Presets' ) }
										</Text>
										<HStack as="div" spacing={ 4 } wrap>
											{ presetDefs.map( ( preset ) => (
												<Button
													key={ preset.id }
													size="compact"
													onClick={ () => setPreset( preset.id ) }
												>
													{ preset.label }
												</Button>
											) ) }
										</HStack>
									</VStack>

									{ /* Two smaller inputs side by side */ }
									<HStack
										as="div"
										spacing={ 8 }
										justify="flex-start"
										className="daterange-inputs"
										wrap={ false }
									>
										<TextControl
											type="date"
											value={ fromStr }
											onChange={ ( value ) => {
												setFromStr( value ?? '' );
												setFromDraft( value ? parseYmdLocal( value ) ?? undefined : undefined );
											} }
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											autoComplete="off"
											style={ { minWidth: 140, flex: '1 1 0' } }
										/>
										<TextControl
											type="date"
											value={ toStr }
											onChange={ ( value ) => {
												setToStr( value ?? '' );
												setToDraft( value ? parseYmdLocal( value ) ?? undefined : undefined );
											} }
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											autoComplete="off"
											style={ { minWidth: 140, flex: '1 1 0' } }
										/>
									</HStack>
								</>
							) : (
								// Desktop: inputs row above, right-aligned
								<HStack
									as="div"
									spacing={ 4 }
									justify="flex-end"
									className="daterange-inputs"
									wrap={ false }
									style={ { width: '100%' } }
								>
									<TextControl
										type="date"
										value={ fromStr }
										onChange={ ( value ) => {
											setFromStr( value ?? '' );
											setFromDraft( value ? parseYmdLocal( value ) ?? undefined : undefined );
										} }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										autoComplete="off"
										style={ { minWidth: 220, flex: '0 0 auto' } }
									/>
									<TextControl
										type="date"
										value={ toStr }
										onChange={ ( value ) => {
											setToStr( value ?? '' );
											setToDraft( value ? parseYmdLocal( value ) ?? undefined : undefined );
										} }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										autoComplete="off"
										style={ { minWidth: 220, flex: '0 0 auto' } }
									/>
								</HStack>
							) }

							{ /* Body: presets left on desktop; single-month calendar on mobile */ }
							<HStack
								as="div"
								spacing={ 4 }
								justify="flex-start"
								className="daterange-body"
								wrap={ false }
							>
								{ ! isSmall && (
									<VStack as="div" spacing={ 2 } className="daterange-presets">
										<Text as="div" weight={ 600 }>
											{ __( 'Presets' ) }
										</Text>
										{ presetDefs.map( ( preset ) => (
											<Button
												key={ preset.id }
												size="compact"
												onClick={ () => setPreset( preset.id ) }
											>
												{ preset.label }
											</Button>
										) ) }
									</VStack>
								) }

								<div className="daterange-calendar">
									<DateRangeCalendar
										numberOfMonths={ isSmall ? 1 : 2 }
										defaultMonth={ defaultMonth }
										endMonth={ endMonth }
										disabled={ { after: today } }
										excludeDisabled
										selected={ { from: fromDraft, to: toDraft } }
										onSelect={ ( range ) => {
											if ( range?.from ) {
												setFromDraft( range.from );
												setFromStr( formatYmd( range.from, timezoneString, gmtOffset ) );
											}
											if ( range?.to ) {
												setToDraft( range.to );
												setToStr( formatYmd( range.to, timezoneString, gmtOffset ) );
											}
										} }
									/>
								</div>
							</HStack>

							<HStack as="div" spacing={ 2 } justify="flex-end" style={ { marginTop: 12 } }>
								<Button variant="secondary" onClick={ clear }>
									{ __( 'Clear' ) }
								</Button>
								<Button variant="primary" onClick={ apply } disabled={ ! fromDraft || ! toDraft }>
									{ __( 'Apply' ) }
								</Button>
							</HStack>
						</div>
					);
				} }
			/>
		</div>
	);
}
