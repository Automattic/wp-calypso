import { translate } from 'i18n-calypso';
import { formatLargeNumber } from '../../utils';
import './style.scss';

type Props = {
	totalImpressions?: number;
	totalClicks?: number;
	outerContainerClass?: string;
};

export default function CampaignsTotalStats( {
	totalImpressions,
	totalClicks,
	outerContainerClass,
}: Props ) {
	return (
		<div className={ outerContainerClass }>
			<div className="campaigns-total-stats__container">
				<div className="campaigns-total-stats__item">
					<div className="campaigns-total-stats__label">
						{ translate( 'Total people reached' ) }
					</div>
					<div className="campaigns-total-stats__result">
						{ formatLargeNumber( totalImpressions || 0 ) }
					</div>
				</div>
				<div className="campaigns-total-stats__item">
					<div className="campaigns-total-stats__label">{ translate( 'Total clicks' ) }</div>
					<div className="campaigns-total-stats__result">
						{ formatLargeNumber( totalClicks || 0 ) }
					</div>
				</div>
			</div>
		</div>
	);
}
