import { Dropdown, Tooltip, Button } from '@wordpress/components';
import { useMediaQuery, useInstanceId } from '@wordpress/compose';
import { useMemo, useState, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
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
};

const today = new Date();
( today as Date ).setHours( 0, 0, 0, 0 );

export function DateRangePicker( {
	start,
	end,
	onChange,
	gmtOffset,
	timezoneString,
}: DateRangePickerProps ) {
	const locale = useLocale();
	const isSmall = useMediaQuery( '(max-width: 600px)' );
	const instanceId = useInstanceId( DateRangePicker, 'daterange' );
	const mobileLabelId = `presets-label-${ instanceId }-mobile`;
	const desktopLabelId = `presets-label-${ instanceId }-desktop`;

	const label = useMemo(
		() => formatLabel( start, end, locale, timezoneString, gmtOffset ),
		[ start, end, locale, timezoneString, gmtOffset ]
	);

	const [ fromDraft, setFromDraft ] = useState< Date | undefined >( () => start );
	const [ toDraft, setToDraft ] = useState< Date | undefined >( () => end );
	const [ fromStr, setFromStr ] = useState( () => formatYmd( start, timezoneString, gmtOffset ) );
	const [ toStr, setToStr ] = useState( () => formatYmd( end, timezoneString, gmtOffset ) );
	// Tracks the keyboard-focused preset in the listbox (roving focus), not the selected preset.
	const [ compositeActiveId, setCompositeActiveId ] = useState< string | null >( null );

	const siteToday = useMemo(
		() => parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) )!,
		[ timezoneString, gmtOffset ]
	);
	const siteTodayStr = useMemo(
		() => formatYmd( siteToday, timezoneString, gmtOffset ),
		[ siteToday, timezoneString, gmtOffset ]
	);

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
				renderContent={ ( { onClose } ) => (
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
						siteToday={ siteToday }
						siteTodayStr={ siteTodayStr }
						mobileLabelId={ mobileLabelId }
						desktopLabelId={ desktopLabelId }
					/>
				) }
			/>
		</div>
	);
}
