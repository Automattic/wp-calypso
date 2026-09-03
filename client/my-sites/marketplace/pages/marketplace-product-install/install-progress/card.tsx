import './style.scss';

import { Step } from '@automattic/onboarding';
import { Button, ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import ExpectationChecklist from 'calypso/components/expectation-checklist';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	useOverrunCopy,
	useStageSentences,
	useStageTitles,
	useStalledActionLabel,
	useStalledCopy,
} from './copy';
import { INSTALL_STAGES } from './get-install-stage';
import { useInstallProgress } from './use-install-progress';

/**
 * The transfer wait: a heading, one sentence naming the stage the transfer is actually in, a
 * single real overall bar, and the “what to expect” card. The bar is fed by confirmed stages,
 * never a timer.
 */
export default function InstallProgressCard( {
	transferStatus,
	currentStep,
	startedAt,
	siteSlug,
	productSlug,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
	siteSlug?: string | null;
	productSlug?: string;
} ) {
	const translate = useTranslate();
	const { stage, stageElapsed, isOverrun, isStalled, overallProgress } = useInstallProgress( {
		transferStatus,
		currentStep,
		startedAt,
	} );
	const stageKey = INSTALL_STAGES[ stage ].key;
	const stageTitles = useStageTitles();
	const sentences = useStageSentences();
	const overrunCopy = useOverrunCopy();
	const stalledCopy = useStalledCopy();
	const stalledActionLabel = useStalledActionLabel();

	// The bar re-renders twice a second; keep the elapsed figure out of the effect's deps.
	const stageElapsedRef = useRef( stageElapsed );
	stageElapsedRef.current = stageElapsed;
	const reportedStalledRef = useRef( false );
	useEffect( () => {
		if ( ! isStalled || reportedStalledRef.current ) {
			return;
		}
		reportedStalledRef.current = true;
		recordTracksEvent( 'calypso_marketplace_install_wait_stalled', { product_slug: productSlug } );
	}, [ isStalled, productSlug ] );

	const showEscape = isStalled && !! siteSlug;

	return (
		<div className="marketplace-install-progress">
			<div className="marketplace-install-progress__header">
				<Step.Heading text={ translate( 'Setting up your plugin' ) } align="center" />
				<p className="marketplace-install-progress__stage" role="status">
					{ sentences[ stageKey ] }
				</p>
				{ ( isStalled || isOverrun ) && (
					<p className="marketplace-install-progress__overrun" role="status">
						{ isStalled ? stalledCopy : overrunCopy }
					</p>
				) }
			</div>
			<div className="marketplace-install-progress__progress">
				<ProgressBar
					className="marketplace-install-progress__progress-bar"
					value={ overallProgress }
					aria-label={ String( stageTitles[ stageKey ] ) }
				/>
				{ showEscape && (
					<Button
						className="marketplace-install-progress__escape"
						variant="link"
						href={ `/plugins/${ siteSlug }` }
						onClick={ () =>
							recordTracksEvent( 'calypso_marketplace_install_wait_stalled_click', {
								product_slug: productSlug,
								stage_seconds: Math.round( stageElapsedRef.current ),
							} )
						}
					>
						{ stalledActionLabel }
					</Button>
				) }
			</div>
			<ExpectationChecklist
				title={ translate( "Here's what to expect" ) }
				items={ [
					{
						icon: 'time',
						text: translate(
							'Setting up usually takes about a minute — your site is getting its own dedicated server.'
						),
					},
					{
						icon: 'checkmark',
						text: translate( 'Your site stays online while we work.' ),
					},
					{
						icon: 'plugins',
						text: translate(
							'Your plugin is installed and activated automatically once the server is ready.'
						),
					},
				] }
			/>
		</div>
	);
}
