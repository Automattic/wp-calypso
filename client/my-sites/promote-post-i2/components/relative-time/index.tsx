import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import InfoPopover from 'calypso/components/info-popover';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import './style.scss';

type RelativeTimeProps = {
	date: string;
	showTooltip: boolean;
	tooltipTitle: string;
};

function RelativeTime( props: RelativeTimeProps ) {
	const { date, showTooltip, tooltipTitle } = props;

	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const timestamp = moment( Date.parse( date ) );

	function getShortDateString( timestamp: moment.Moment ) {
		const now = moment();

		if ( Math.abs( now.diff( timestamp, 'days' ) ) < 7 ) {
			return timestamp.fromNow();
		}

		const displayedTime = timestamp.calendar( null, { sameElse: 'll' } );

		// If the content was (or is scheduled to be) published within the calendar year, do not display the year
		return timestamp.isSame( now, 'year' )
			? displayedTime.replace( timestamp.format( 'Y' ), '' ).replace( ',', '' )
			: displayedTime;
	}

	function getLongDateString() {
		// translators: ll refers to date (eg. 21 Apr) & LT refers to time (eg. 18:00) - "at" is translated
		const sameElse: string = translate( 'll [at] LT' );
		return timestamp.calendar( null, { sameElse } );
	}

	return (
		<div className="relative-time-tooltip__container">
			<div className="relative-time-tooltip__short-date">{ getShortDateString( timestamp ) }</div>
			{ showTooltip && (
				<InfoPopover position="bottom" className="relative-time-tooltip">
					<div key="title" className="relative-time-tooltip__title">
						{ tooltipTitle }
					</div>
					<div key="date" className="relative-time-tooltip__date">
						{ getLongDateString() }
					</div>
				</InfoPopover>
			) }
		</div>
	);
}

RelativeTime.propTypes = {
	date: PropTypes.string.isRequired,
	showTooltip: PropTypes.bool,
	tooltipTitle: PropTypes.string, // e.g. "Published date" for posts.
};

RelativeTime.defaultProps = {
	showTooltip: false,
	tooltipTitle: '',
};

export default RelativeTime;
