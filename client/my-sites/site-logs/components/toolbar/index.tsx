import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import './style.scss';

type toolbarProps = {
	startDateTime: number;
	endDateTime: number;
	onDateTimeCommit?: ( startDate: Date, endDate: Date ) => void;
};

const Toolbar = ( { startDateTime, endDateTime, onDateTimeCommit }: toolbarProps ) => {
	const moment = useLocalizedMoment();

	const handleDateRangeCommit = ( startDate: Date, endDate: Date ) => {
		if ( ! startDate || ! endDate ) {
			return;
		}
		onDateTimeCommit?.( startDate, endDate );
	};

	return (
		<div className="site-logs__toolbar">
			<DateRange
				showTriggerClear={ false }
				selectedStartDate={ moment.unix( startDateTime ).toDate() }
				selectedEndDate={ moment.unix( endDateTime ).toDate() }
				lastSelectableDate={ moment().toDate() }
				dateFormat="ll @ HH:mm:ss"
				onDateCommit={ handleDateRangeCommit }
			/>
		</div>
	);
};

export default Toolbar;
