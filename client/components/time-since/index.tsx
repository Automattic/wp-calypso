import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useHumanDate } from 'calypso/lib/human-date';

interface TimeSinceProps {
	date: string;
	dateFormat?: string;
	className?: string;
}

function TimeSince( { className, date, dateFormat = 'll' }: TimeSinceProps ) {
	const moment = useLocalizedMoment();
	const fullDate = moment( date ).format( 'llll' );
	const humanDate = useHumanDate( date, dateFormat );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
