import { Button } from '@wordpress/components';
import { Icon, check, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso'; // Ensure this import is present
import moment from 'moment'; // Assuming moment is used for date calculations
import PropTypes from 'prop-types';

const STATS_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

const DateControlPickerShortcuts = ( {
	currentShortcut,
	onClick,
}: {
	currentShortcut?: string;
	onClick: ( shortcut: any ) => void;
} ) => {
	const translate = useTranslate();

	const generateShortcutList = () => {
		return [
			{
				id: 'last_7_days',
				label: translate( 'Last 7 Days' ),
				offset: 0,
				range: 6,
				period: STATS_PERIOD.DAY,
			},
			{
				id: 'last_30_days',
				label: translate( 'Last 30 Days' ),
				offset: 0,
				range: 29,
				period: STATS_PERIOD.DAY,
			},
			{
				id: 'last_3_months',
				label: translate( 'Last 90 Days' ),
				offset: 0,
				range: 89,
				period: STATS_PERIOD.WEEK,
			},
			{
				id: 'last_year',
				label: translate( 'Last Year' ),
				offset: 0,
				range: 364, // ranges are zero based!
				period: STATS_PERIOD.MONTH,
			},
		];
	};

	const shortcutList = generateShortcutList(); // Generate the shortcut list if one isn't provided

	const handleClick = ( shortcut: {
		id?: string;
		label?: any;
		offset: any;
		range: any;
		period?: string;
	} ) => {
		const { offset, range } = shortcut; // Assuming these are part of the shortcut structure
		const newToDate = moment().subtract( offset, 'days' ); // Ensure this is a Moment object
		const newFromDate = moment().subtract( offset + range, 'days' ); // Ensure this is a Moment object

		onClick( { newFromDate, newToDate } ); // Pass both dates back to the parent
	};

	return (
		<div className="date-control-picker-shortcuts">
			<ul className="date-control-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => {
					const isSelected = shortcut.id === currentShortcut;

					return (
						<li
							className={ clsx( 'date-control-picker-shortcuts__shortcut', {
								'is-selected': isSelected,
							} ) }
							key={ shortcut.id || idx }
						>
							<Button
								onClick={ () => {
									handleClick( shortcut );
								} }
								aria-label={ `Time range ${ shortcut.label }. Click to select.` }
							>
								<span>{ shortcut.label }</span>
								{ isSelected && <Icon icon={ check } /> }
								{ ! isSelected && <Icon icon={ lock } /> }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

DateControlPickerShortcuts.propTypes = {
	currentShortcut: PropTypes.string,
	onClick: PropTypes.func.isRequired,
};

export default DateControlPickerShortcuts;
