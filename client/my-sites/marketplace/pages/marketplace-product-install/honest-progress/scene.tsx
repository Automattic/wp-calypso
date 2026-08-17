import './style.scss';

import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useHonestStageCopy } from './copy';
import HonestFooter from './footer';
import RackScene from './rack-scene';
import { useHonestProgress } from './use-honest-progress';

/**
 * The graphic honest wait: the same three real stages as the narrated list, told as a scene,
 * driven by the same status-backed clock so it cannot finish before the transfer does.
 */
export default function HonestInstallScene( {
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
			<h1 className="marketplace-honest-progress__heading">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<RackScene
				stage={ stage }
				preparingProgress={ getStageProgress( 0 ) }
				label={ String( stages[ stage ].title ) }
			/>
			<p className="marketplace-honest-scene__caption" role="status">
				{ stages[ stage ].title }
			</p>
			<p className="marketplace-honest-scene__caption-detail">{ stages[ stage ].description }</p>
			<ol className="marketplace-honest-scene__dots" aria-hidden="true">
				{ stages.map( ( _, index ) => (
					<li
						key={ index }
						className={ clsx( 'marketplace-honest-scene__dot', {
							'is-done': index < stage,
							'is-active': index === stage,
						} ) }
					/>
				) ) }
			</ol>
			<HonestFooter elapsed={ elapsed } isOverrun={ isOverrun } />
		</div>
	);
}
