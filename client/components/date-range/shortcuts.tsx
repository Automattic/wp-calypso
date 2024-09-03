import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const DATERANGE_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

const DateRangePickerShortcuts = ( {
	currentShortcut,
	onClick,
}: {
	currentShortcut?: string;
	onClick: ( newFromDate: moment.Moment, newToDate: moment.Moment ) => void;
} ) => {
	const translate = useTranslate();
	const [ selectedShortcut, setSelectedShortcut ] = useState( currentShortcut );

	useEffect( () => {
		setSelectedShortcut( currentShortcut );
	}, [ currentShortcut ] );

	const getShortcutList = () => [
		{
			id: 'last_7_days',
			label: translate( 'Last 7 Days' ),
			offset: 0,
			range: 6,
			period: DATERANGE_PERIOD.DAY,
		},
		{
			id: 'last_30_days',
			label: translate( 'Last 30 Days' ),
			offset: 0,
			range: 29,
			period: DATERANGE_PERIOD.DAY,
		},
		{
			id: 'last_3_months',
			label: translate( 'Last 90 Days' ),
			offset: 0,
			range: 89,
			period: DATERANGE_PERIOD.WEEK,
		},
		{
			id: 'last_year',
			label: translate( 'Last Year' ),
			offset: 0,
			range: 364, // ranges are zero based!
			period: DATERANGE_PERIOD.MONTH,
		},
	];

	const shortcutList = getShortcutList();

	const handleClick = ( { id, offset, range }: { id?: string; offset: number; range: number } ) => {
		setSelectedShortcut( id );
		const newToDate = moment().subtract( offset, 'days' );
		const newFromDate = moment().subtract( offset + range, 'days' );

		onClick( newFromDate, newToDate );
	};

	return (
		<div className="date-control-picker-shortcuts__inner">
			<ul className="date-control-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => (
					<li
						className={ clsx( 'date-control-picker-shortcuts__shortcut', {
							'is-selected': shortcut.id === selectedShortcut,
						} ) }
						key={ shortcut.id || idx }
					>
						<Button
							onClick={ () => handleClick( shortcut ) }
							aria-label={ `Time range ${ shortcut.label }. Click to select.` }
						>
							<span>{ shortcut.label }</span>
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
