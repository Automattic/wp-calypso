import { DateRangeCalendar } from '@automattic/ui';
import {
	__experimentalText as Text,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	VisuallyHidden,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { formatYmd } from '../../utils/datetime';
import { DateInputs } from './date-inputs';
import { PresetsListbox } from './presets-listbox';
import { computePresetRange, getActivePresetId, PresetId } from './utils';

type DateRangeContentProps = {
	isSmall: boolean;
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
	siteToday: Date;
	siteTodayStr: string;
	mobileLabelId: string;
	desktopLabelId: string;
};

const today = new Date();
( today as Date ).setHours( 0, 0, 0, 0 );

export function DateRangeContent( props: DateRangeContentProps ) {
	const {
		isSmall,
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
		siteToday,
		siteTodayStr,
		mobileLabelId,
		desktopLabelId,
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
		const range = computePresetRange( id, siteToday );
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

	const activePresetId = getActivePresetId( fromDraft, toDraft, siteToday );

	const defaultMonth = isSmall ? today : new Date( today.getFullYear(), today.getMonth() - 1, 1 );
	const endMonth = new Date( today.getFullYear(), today.getMonth(), 1 );

	return (
		<div style={ { padding: 12 } }>
			<Text as="div" weight={ 600 } align="center" size="smallTitle" style={ { marginBottom: 8 } }>
				{ __( 'Date Range' ) }
			</Text>

			{ isSmall ? (
				<>
					<VStack
						as="div"
						spacing={ 1 }
						className="daterange-presets"
						style={ { marginBottom: 16 } }
					>
						<VisuallyHidden id={ mobileLabelId }>{ __( 'Date range presets' ) }</VisuallyHidden>
						<PresetsListbox
							labelId={ mobileLabelId }
							activePresetId={ activePresetId }
							onSelect={ setPreset }
							compositeActiveId={ compositeActiveId }
							setCompositeActiveId={ setCompositeActiveId }
						/>
					</VStack>

					<DateInputs
						fromStr={ fromStr }
						toStr={ toStr }
						onFromChange={ ( value ) => setFromStr( value ) }
						onToChange={ ( value ) => setToStr( value ) }
						todayStr={ siteTodayStr }
						fromStyle={ { minWidth: 140, flex: '1 1 0' } }
						toStyle={ { minWidth: 140, flex: '1 1 0' } }
					/>
				</>
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
						todayStr={ siteTodayStr }
						fromStyle={ { minWidth: 220, flex: '0 0 auto' } }
						toStyle={ { minWidth: 220, flex: '0 0 auto' } }
						justify="flex-end"
						containerStyle={ { width: '100%' } }
					/>
				</HStack>
			) }

			<HStack as="div" spacing={ 4 } justify="flex-start" className="daterange-body" wrap={ false }>
				{ ! isSmall && (
					<VStack as="div" spacing={ 2 } className="daterange-presets">
						<VisuallyHidden id={ desktopLabelId }>{ __( 'Date range presets' ) }</VisuallyHidden>
						<PresetsListbox
							labelId={ desktopLabelId }
							activePresetId={ activePresetId }
							onSelect={ setPreset }
							compositeActiveId={ compositeActiveId }
							setCompositeActiveId={ setCompositeActiveId }
						/>
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
}
