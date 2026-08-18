import './style.scss';

import { useTranslate } from 'i18n-calypso';
import { useHonestStageCopy } from './copy';
import HonestFooter from './footer';
import RackScene from './rack-scene';
import StageList from './stage-list';
import { useHonestProgress } from './use-honest-progress';

/**
 * Scene and list together: the illustration for the glance, the narrated stages for the detail.
 * One clock underneath, as with the other two.
 */
export default function HonestInstallCombined( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const translate = useTranslate();
	const { stage, elapsed, isOverrun, getStageProgress } = useHonestProgress( {
		transferStatus,
		currentStep,
		startedAt,
	} );
	const stages = useHonestStageCopy();

	return (
		<div className="marketplace-honest-progress marketplace-honest-scene">
			<h1 className="marketplace-honest-progress__heading wp-brand-font">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<RackScene
				compact
				stage={ stage }
				preparingProgress={ getStageProgress( 0 ) }
				label={ String( stages[ stage ].title ) }
			/>
			<StageList stage={ stage } getStageProgress={ getStageProgress } />
			<HonestFooter elapsed={ elapsed } isOverrun={ isOverrun } />
		</div>
	);
}
