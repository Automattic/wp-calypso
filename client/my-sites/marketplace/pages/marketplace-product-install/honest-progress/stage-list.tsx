import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useHonestStageCopy } from './copy';
import { HONEST_STAGES } from './get-honest-stage';

/**
 * The narrated three-stage list with per-stage bars. Pure — draws the stage and progress it is
 * given.
 */
export default function StageList( {
	stage,
	getStageProgress,
}: {
	stage: number;
	getStageProgress: ( index: number ) => number;
} ) {
	const translate = useTranslate();
	const stages = useHonestStageCopy();

	return (
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
	);
}
