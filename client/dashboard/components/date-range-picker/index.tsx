import { Dropdown, Tooltip, Button } from '@wordpress/components';
import { useMediaQuery, useInstanceId } from '@wordpress/compose';
import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { format } from 'date-fns';
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
	timezoneString,
	gmtOffset,
	locale,
	disableFuture = true,
}: DateRangePickerProps ) {
	const isSmall = useMediaQuery( '(max-width: 600px)' );
	// Use a wider breakpoint to decide when two calendars can fit comfortably
	const showTwoMonths = useMediaQuery( '(min-width: 900px)' );
	const instanceId = useInstanceId( DateRangePicker, 'daterange' );
	const mobileLabelId = `presets-label-${ instanceId }-mobile`;
	const desktopLabelId = `presets-label-${ instanceId }-desktop`;

	const label = formatLabel( start, end, locale );

	// Reset internal draft state when key inputs change by remounting the inner component
	// Use UTC formatting for consistency with the rest of the component
	const resetKey = [ format( start, 'yyyy-MM-dd' ), format( end, 'yyyy-MM-dd' ) ].join( '|' );

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
						onChange={ onChange }
						onClose={ onClose }
						timezoneString={ timezoneString }
						gmtOffset={ gmtOffset }
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
	onChange,
	onClose,
	timezoneString,
	gmtOffset,
	mobileLabelId,
	desktopLabelId,
	disableFuture,
}: {
	isSmall: boolean;
	showTwoMonths: boolean;
	start: Date;
	end: Date;
	onChange: ( next: { start: Date; end: Date } ) => void;
	onClose: () => void;
	timezoneString?: string;
	gmtOffset?: number;
	mobileLabelId: string;
	desktopLabelId: string;
	disableFuture: boolean;
} ) {
	const [ fromDraft, setFromDraft ] = useState< Date | undefined >( () => start );
	const [ toDraft, setToDraft ] = useState< Date | undefined >( () => end );
	// Use UTC formatting without timezone conversion for consistency
	const [ fromStr, setFromStr ] = useState( () => format( start, 'yyyy-MM-dd' ) );
	const [ toStr, setToStr ] = useState( () => format( end, 'yyyy-MM-dd' ) );
	// Tracks the keyboard-focused preset in the listbox (roving focus), not the selected preset.
	const [ compositeActiveId, setCompositeActiveId ] = useState< string | null >( null );

	const today = useMemo( () => {
		// Use UTC-based today calculation for consistency
		const utcNow = new Date();
		return new Date(
			Date.UTC( utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() )
		);
	}, [] );

	const todayStr = useMemo(
		() => format( today, 'yyyy-MM-dd' ), // No timezone conversion needed
		[ today ]
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
			onChange={ onChange }
			onClose={ onClose }
			timezoneString={ timezoneString }
			gmtOffset={ gmtOffset }
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
