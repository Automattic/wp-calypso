import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';

const DATERANGE_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

const DateRangePickerShortcuts = ( {
	currentShortcut,
	onClick,
	locked = false,
}: {
	currentShortcut?: string;
	onClick: ( newFromDate: moment.Moment, newToDate: moment.Moment, shortcutId: string ) => void;
	locked?: boolean;
} ) => {
	const translate = useTranslate();

	const getShortcutList = () => [
		{
			id: 'last_7_days',
			label: translate( 'Last 7 Days' ),
			offset: 0,
			range: 6,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_7_days',
		},
		{
			id: 'last_30_days',
			label: translate( 'Last 30 Days' ),
			offset: 0,
			range: 29,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_30_days',
		},
		{
			id: 'last_3_months',
			label: translate( 'Last 90 Days' ),
			offset: 0,
			range: 89,
			period: DATERANGE_PERIOD.WEEK,
			shortcutId: 'last_3_months',
		},
		{
			id: 'last_year',
			label: translate( 'Last Year' ),
			offset: 0,
			range: 364, // ranges are zero based!
			period: DATERANGE_PERIOD.MONTH,
			shortcutId: 'last_year',
		},
		{
			id: 'custom_date_range',
			label: translate( 'Custom Range' ),
			offset: 0,
			range: 0,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'custom_date_range',
		},
	];

	const shortcutList = getShortcutList();

	const handleClick = ( { id, offset, range }: { id?: string; offset: number; range: number } ) => {
		const newToDate = moment().subtract( offset, 'days' );
		const newFromDate = moment().subtract( offset + range, 'days' );

		onClick( newFromDate, newToDate, id || '' );
	};

	return (
		<div className="date-range-picker-shortcuts__inner">
			<ul className="date-range-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => (
					<li
						className={ clsx( 'date-range-picker-shortcuts__shortcut', {
							'is-selected': shortcut.id === currentShortcut,
						} ) }
						key={ shortcut.id || idx }
					>
						<Button onClick={ () => ! locked && handleClick( shortcut ) }>
							<span>{ shortcut.label }</span>
							{ shortcut.id === currentShortcut && <Icon icon={ check } /> }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

DateRangePickerShortcuts.propTypes = {
	currentShortcut: PropTypes.string,
	onClick: PropTypes.func.isRequired,
};

export default DateRangePickerShortcuts;
