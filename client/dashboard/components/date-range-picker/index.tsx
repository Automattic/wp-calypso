import { DateRangeCalendar } from '@automattic/ui';
import {
	Dropdown,
	Tooltip,
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import { formatRangeLabelSiteTimeZone } from '../../utils/datetime';

import './style.scss';

type LogsDateRangePickerInputProps = {
	start: Date;
	end: Date;
	onChange: ( next: { start: Date; end: Date } ) => void;
	gmtOffset: number;
	className?: string;
};

export function DateRangePicker( {
	start,
	end,
	gmtOffset,
	onChange,
	className,
}: LogsDateRangePickerInputProps ) {
	const locale = useLocale();

	const label = useMemo(
		() => formatRangeLabelSiteTimeZone( start, end, gmtOffset, locale ),
		[ start, end, gmtOffset, locale ]
	);

	const isSmall = useMediaQuery( '(max-width: 600px)' );

	const inputWidthCh = useMemo( () => `${ label.length + 1 }ch`, [ label ] );

	const today = new Date();
	today.setHours( 0, 0, 0, 0 );
	const prevMonth = new Date( today.getFullYear(), today.getMonth() - 1, 1 );
	const endMonth = new Date( today.getFullYear(), today.getMonth(), 1 );

	return (
		<div
			className={ `logs-date-input__container${ className ? ` ${ className }` : '' }` }
			style={ { display: 'flex', justifyContent: 'flex-end', width: '100%' } }
		>
			<Dropdown
				renderToggle={ ( { onToggle, isOpen } ) => (
					<Tooltip text={ __( 'Select a date range' ) } placement="top">
						<div className="logs-date-input__toggle">
							<InputControl
								value={ label }
								onChange={ () => {} }
								readOnly
								suffix={ <Icon icon={ calendar } size={ 24 } style={ { marginRight: 8 } } /> }
								onClick={ onToggle }
								onKeyDown={ ( e ) => {
									if ( e.key === 'Enter' || e.key === ' ' ) {
										e.preventDefault();
										onToggle();
									}
								} }
								__next40pxDefaultSize
								style={ { width: inputWidthCh } }
								className="logs-date-input__field"
								aria-expanded={ isOpen }
							/>
						</div>
					</Tooltip>
				) }
				renderContent={ () => (
					<div className="logs-date-input__popover">
						<Text as="div" weight={ 600 } size="smallTitle">
							{ __( 'Date Range' ) }
						</Text>
						<DateRangeCalendar
							numberOfMonths={ isSmall ? 1 : 2 }
							selected={ { from: start, to: end } }
							onSelect={ ( range ) => {
								if ( range?.from && range.to ) {
									onChange( { start: range.from, end: range.to } );
								}
							} }
							disabled={ { after: today } }
							defaultMonth={ isSmall ? today : prevMonth }
							endMonth={ endMonth }
						/>
					</div>
				) }
			/>
		</div>
	);
}
