import './style.scss';

import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { getHonestStage, HONEST_STAGES } from './get-honest-stage';

const TICK_MS = 500;

// A stage's bar approaches but never reaches full until the server confirms the stage —
// the visual must not outrun the transfer.
const MAX_UNCONFIRMED_PROGRESS = 92;

// How far past a stage's typical duration we wait before saying it's running long.
const OVERRUN_FACTOR = 1.6;

export default function HonestInstallProgress( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ) {
	const translate = useTranslate();
	const stage = getHonestStage( { transferStatus, currentStep } );

	const [ elapsed, setElapsed ] = useState( 0 );
	const [ stageElapsed, setStageElapsed ] = useState( 0 );
	const previousStageRef = useRef( stage );

	useEffect( () => {
		const id = setInterval( () => {
			setElapsed( ( seconds ) => seconds + TICK_MS / 1000 );
			setStageElapsed( ( seconds ) => seconds + TICK_MS / 1000 );
		}, TICK_MS );
		return () => clearInterval( id );
	}, [] );

	useEffect( () => {
		if ( previousStageRef.current !== stage ) {
			previousStageRef.current = stage;
			setStageElapsed( 0 );
		}
	}, [ stage ] );

	const stages = [
		{
			title: translate( 'Preparing a dedicated server for your site' ),
			description: translate( 'Your site is getting its own hardware — this is the longest part.' ),
		},
		{
			title: translate( 'Moving your site to its new server' ),
			description: translate( 'Content, media, and settings come along.' ),
		},
		{
			title: translate( 'Finishing up' ),
			description: translate( 'Installing and activating your plugin.' ),
		},
	];

	const isOverrun = stageElapsed > HONEST_STAGES[ stage ].expectedSeconds * OVERRUN_FACTOR;

	return (
		<div className="marketplace-honest-progress">
			<h1 className="marketplace-honest-progress__heading">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<ol className="marketplace-honest-progress__stages">
				{ stages.map( ( { title, description }, index ) => {
					const isDone = index < stage;
					const isActive = index === stage;
					let progress = 0;
					if ( isDone ) {
						progress = 100;
					} else if ( isActive ) {
						progress = Math.min(
							( stageElapsed / HONEST_STAGES[ index ].expectedSeconds ) * 100,
							MAX_UNCONFIRMED_PROGRESS
						);
					}
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
			<p className="marketplace-honest-progress__meta">
				{ translate( 'Elapsed: %(elapsed)ds · usually takes about a minute', {
					args: { elapsed: Math.floor( elapsed ) },
				} ) }
			</p>
			{ isOverrun && (
				<p className="marketplace-honest-progress__overrun" role="status">
					{ translate(
						'This step is taking longer than usual. We’re still working on it — nothing is wrong.'
					) }
				</p>
			) }
		</div>
	);
}
