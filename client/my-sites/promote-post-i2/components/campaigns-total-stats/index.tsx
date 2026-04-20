import { formatNumberCompact } from '@automattic/number-formatters';
import { translate } from 'i18n-calypso';
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
				<div className="campaigns-total-stats__header">
					<div className="campaigns-total-stats__title">Performance</div>
				</div>
				<div className="campaigns-total-stats__items">
					<div className="campaigns-total-stats__item">
						<div className="campaigns-total-stats__label">{ translate( 'Total ad views' ) }</div>
						<div className="campaigns-total-stats__result">
							{ formatNumberCompact( totalImpressions || 0, {
								numberFormatOptions: { maximumFractionDigits: 3 },
							} ) }
						</div>
					</div>
					<div className="campaigns-total-stats__item">
						<div className="campaigns-total-stats__label">{ translate( 'Total clicks' ) }</div>
						<div className="campaigns-total-stats__result">
							{ formatNumberCompact( totalClicks || 0, {
								numberFormatOptions: { maximumFractionDigits: 1 },
							} ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
