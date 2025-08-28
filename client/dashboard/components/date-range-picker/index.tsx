import { Dropdown, Tooltip, Button } from '@wordpress/components';
import { useMediaQuery, useInstanceId } from '@wordpress/compose';
import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { parseYmdLocal, formatYmd } from '../../utils/datetime';
import { DateRangeContent } from './date-range-content';
import { formatLabel } from './utils';
import './style.scss';

type DateRangePickerProps = {
	start: Date;
	end: Date;
	onChange: ( next: { start: Date; end: Date } ) => void;
	timezoneString?: string;
	gmtOffset?: number;
	locale: string;
	disableFuture?: boolean;
};

export function DateRangePicker( {
	start,
	end,
	onChange,
	gmtOffset,
	timezoneString,
	locale,
	disableFuture = true,
}: DateRangePickerProps ) {
	const isSmall = useMediaQuery( '(max-width: 600px)' );
	// Use a wider breakpoint to decide when two calendars can fit comfortably
	const showTwoMonths = useMediaQuery( '(min-width: 900px)' );
	const instanceId = useInstanceId( DateRangePicker, 'daterange' );
	const mobileLabelId = `presets-label-${ instanceId }-mobile`;
	const desktopLabelId = `presets-label-${ instanceId }-desktop`;

	const label = formatLabel( start, end, locale, timezoneString, gmtOffset );

	// Reset internal draft state when key inputs change by remounting the inner component
	const resetKey = [
		formatYmd( start, timezoneString, gmtOffset ),
		formatYmd( end, timezoneString, gmtOffset ),
		timezoneString ?? '',
		gmtOffset ?? '',
	].join( '|' );

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
								icon={ calendar }
								iconPosition="right"
							>
								<span aria-hidden="true" className="daterange-input__text">
									{ label }
								</span>
							</Button>
						</div>
					</Tooltip>
				) }
				renderContent={ ( { onClose } ) => (
					<DateRangePickerInner
						key={ resetKey }
						isSmall={ isSmall }
						showTwoMonths={ showTwoMonths }
						start={ start }
						end={ end }
						timezoneString={ timezoneString }
						gmtOffset={ gmtOffset }
						onChange={ onChange }
						onClose={ onClose }
						mobileLabelId={ mobileLabelId }
						desktopLabelId={ desktopLabelId }
						disableFuture={ disableFuture }
					/>
				) }
			/>
		</div>
	);
}

function DateRangePickerInner( {
	isSmall,
	showTwoMonths,
	start,
	end,
	timezoneString,
	gmtOffset,
	onChange,
	onClose,
	mobileLabelId,
	desktopLabelId,
	disableFuture,
}: {
	isSmall: boolean;
	showTwoMonths: boolean;
	start: Date;
	end: Date;
	timezoneString?: string;
	gmtOffset?: number;
	onChange: ( next: { start: Date; end: Date } ) => void;
	onClose: () => void;
	mobileLabelId: string;
	desktopLabelId: string;
	disableFuture: boolean;
} ) {
	const [ fromDraft, setFromDraft ] = useState< Date | undefined >( () => start );
	const [ toDraft, setToDraft ] = useState< Date | undefined >( () => end );
	const [ fromStr, setFromStr ] = useState( () => formatYmd( start, timezoneString, gmtOffset ) );
	const [ toStr, setToStr ] = useState( () => formatYmd( end, timezoneString, gmtOffset ) );
	// Tracks the keyboard-focused preset in the listbox (roving focus), not the selected preset.
	const [ compositeActiveId, setCompositeActiveId ] = useState< string | null >( null );

	const today = useMemo( () => {
		const parsed = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) );
		// Fallback to local midnight if parsing ever fails
		return (
			parsed ?? new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDate() )
		);
	}, [ timezoneString, gmtOffset ] );

	const todayStr = useMemo(
		() => formatYmd( today, timezoneString, gmtOffset ),
		[ today, timezoneString, gmtOffset ]
	);

	return (
		<DateRangeContent
			isSmall={ isSmall }
			fromDraft={ fromDraft }
			toDraft={ toDraft }
			fromStr={ fromStr }
			toStr={ toStr }
			setFromDraft={ setFromDraft }
			setToDraft={ setToDraft }
			setFromStr={ setFromStr }
			setToStr={ setToStr }
			timezoneString={ timezoneString }
			gmtOffset={ gmtOffset }
			onChange={ onChange }
			onClose={ onClose }
			compositeActiveId={ compositeActiveId }
			setCompositeActiveId={ setCompositeActiveId }
			today={ today }
			todayStr={ todayStr }
			mobileLabelId={ mobileLabelId }
			desktopLabelId={ desktopLabelId }
			disableFuture={ disableFuture }
			showTwoMonths={ showTwoMonths }
		/>
	);
}
