import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import './style.scss';

type toolbarProps = {
	startDateRange: number;
	endDateRange: number;
	onDateRangeCommit?: ( startDate: Date, endDate: Date ) => void;
};

const Toolbar = ( { startDateRange, endDateRange, onDateRangeCommit }: toolbarProps ) => {
	const moment = useLocalizedMoment();

	const handleDateRangeCommit = ( startDate: Date, endDate: Date ) => {
		if ( ! startDate || ! endDate ) {
			return;
		}
		onDateRangeCommit?.( startDate, endDate );
	};

	return (
		<div className="site-logs__toolbar">
			<DateRange
				showTriggerClear={ false }
				selectedStartDate={ moment.unix( startDateRange ).toDate() }
				selectedEndDate={ moment.unix( endDateRange ).toDate() }
				onDateCommit={ handleDateRangeCommit }
			/>
		</div>
	);
};

export default Toolbar;
