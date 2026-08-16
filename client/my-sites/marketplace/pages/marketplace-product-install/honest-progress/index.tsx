import './style.scss';

import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useHonestFooterCopy, useHonestStageCopy } from './copy';
import { HONEST_STAGES } from './get-honest-stage';
import { useHonestProgress } from './use-honest-progress';

export default function HonestInstallProgress( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ) {
	const translate = useTranslate();
	const { stage, elapsed, isOverrun, getStageProgress } = useHonestProgress( {
		transferStatus,
		currentStep,
	} );
	const stages = useHonestStageCopy();
	const footer = useHonestFooterCopy();

	return (
		<div className="marketplace-honest-progress">
			<h1 className="marketplace-honest-progress__heading">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<ol className="marketplace-honest-progress__stages">
				{ stages.map( ( { title, description }, index ) => {
					const isDone = index < stage;
					const isActive = index === stage;
					const progress = getStageProgress( index );
					let stageNote: React.ReactNode = '';
					if ( isActive ) {
						stageNote = description;
					} else if ( isDone ) {
						stageNote = translate( 'Done' );
					}
					return (
						<li
							key={ HONEST_STAGES[ index ].key }
							className={ clsx( 'marketplace-honest-progress__stage', {
								'is-done': isDone,
								'is-active': isActive,
							} ) }
						>
							<span className="marketplace-honest-progress__stage-indicator">
								{ isDone && <Gridicon icon="checkmark" size={ 12 } /> }
							</span>
							<span className="marketplace-honest-progress__stage-body">
								<span className="marketplace-honest-progress__stage-title">{ title }</span>
								<span
									className="marketplace-honest-progress__stage-description"
									role={ isActive ? 'status' : undefined }
								>
									{ stageNote }
								</span>
								<span
									className="marketplace-honest-progress__stage-bar"
									role="progressbar"
									aria-valuemin={ 0 }
									aria-valuemax={ 100 }
									aria-valuenow={ Math.round( progress ) }
									aria-label={ String( title ) }
								>
									<span
										className="marketplace-honest-progress__stage-bar-fill"
										style={ { width: `${ progress }%` } }
									/>
								</span>
							</span>
						</li>
					);
				} ) }
			</ol>
			<p className="marketplace-honest-progress__meta">{ footer.elapsed( elapsed ) }</p>
			{ isOverrun && (
				<p className="marketplace-honest-progress__overrun" role="status">
					{ footer.overrun }
				</p>
			) }
			<p className="marketplace-honest-progress__education">{ footer.education }</p>
		</div>
	);
}
