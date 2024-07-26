import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export type PlanBandwidthBarProps = { children?: React.ReactNode; siteId: number };

const BANDWIDTH_USED = 50;
// Bandwidth is unlimited, so we maintain a constant 10x max
// Nice-to-have: Make this more dynamic so there's some feedback as traffic grows,
// but slow/stop the progress bar as the usage grows so it never goes past a
// certain point
const BANDWIDTH_MAX = BANDWIDTH_USED * 10;

export default function PlanBandwidthBar( props: PlanBandwidthBarProps ) {
	const { children, siteId } = props;

	const translate = useTranslate();
	const percent = Math.round( ( BANDWIDTH_USED / BANDWIDTH_MAX ) * 100 );

	return (
		<>
			<div className="hosting-overview__plan-bandwidth-title-wrapper">
				<div className="hosting-overview__plan-bandwidth-title">{ translate( 'Bandwidth' ) }</div>
				<span>
					{ translate( '%(usedBandwidth)s MB used this month', {
						args: {
							usedBandwidth: BANDWIDTH_USED,
						},
						comment:
							'Describes the amount of bandwidth used this month (e.g., 20 MB used this month)',
					} ) }
				</span>
			</div>
			<ProgressBar color="var(--studio-red-30)" value={ percent } total={ 100 }></ProgressBar>
			{ children }
		</>
	);
}
