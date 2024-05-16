import InfoPopover from 'calypso/components/info-popover';
import { getShortDateString, getLongDateString } from '../../utils';
import './style.scss';

type RelativeTimeProps = {
	date: string;
	showTooltip?: boolean;
	tooltipTitle?: string;
};

function RelativeTime( props: RelativeTimeProps ) {
	const { date, showTooltip = false, tooltipTitle = '' } = props;

	return (
		<div className="relative-time-tooltip__container">
			<div className="relative-time-tooltip__short-date">{ getShortDateString( date ) }</div>
			{ showTooltip && (
				<InfoPopover position="bottom" className="relative-time-tooltip" showOnHover>
					<div key="title" className="relative-time-tooltip__title">
						{ tooltipTitle }
					</div>
					<div key="date" className="relative-time-tooltip__date">
						{ getLongDateString( date ) }
					</div>
				</InfoPopover>
			) }
		</div>
	);
}

export default RelativeTime;
