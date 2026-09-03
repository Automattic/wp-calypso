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
export default function TransferWaitCard( {
	transferStatus,
	fallbackStep = 0,
	startedAt,
	isPluginInstall = true,
	siteSlug,
	productSlug,
}: {
	transferStatus: string | null;
	fallbackStep?: number;
	startedAt?: number | null;
	isPluginInstall?: boolean;
	siteSlug?: string | null;
	productSlug?: string;
} ) {
	const translate = useTranslate();
	const { stage, stageElapsed, isOverrun, isStalled, overallProgress } = useInstallProgress( {
		transferStatus,
		fallbackStep,
		startedAt,
	} );
	const stageKey = INSTALL_STAGES[ stage ].key;
	const stageTitles = useStageTitles();
	const sentences = useStageSentences( isPluginInstall );
	const overrunCopy = useOverrunCopy();
	const stalledCopy = useStalledCopy( isPluginInstall );
	const stalledActionLabel = useStalledActionLabel( isPluginInstall );
	const heading = isPluginInstall
		? translate( 'Setting up your plugin' )
		: translate( 'Setting up your site' );
	const finalChecklistText = isPluginInstall
		? translate( 'Your plugin is installed and activated automatically once the server is ready.' )
		: translate( 'Your site is ready to use once the transfer is complete.' );

	// The bar re-renders twice a second; keep the elapsed figure out of the effect's deps.
	const stageElapsedRef = useRef( stageElapsed );
	stageElapsedRef.current = stageElapsed;
	const reportedStalledRef = useRef( false );
	const waitType = isPluginInstall ? 'plugin_install' : 'site_transfer';
	useEffect( () => {
		if ( ! isStalled || reportedStalledRef.current ) {
			return;
		}
		reportedStalledRef.current = true;
		recordTracksEvent( 'calypso_transfer_wait_stalled', {
			wait_type: waitType,
			...( productSlug ? { product_slug: productSlug } : {} ),
		} );
	}, [ isStalled, waitType, productSlug ] );

	const showEscape = isStalled && !! siteSlug;

	return (
		<div className="transfer-wait">
			<div className="transfer-wait__header">
				<Step.Heading text={ heading } align="center" />
				<p className="transfer-wait__stage" role="status">
					{ sentences[ stageKey ] }
				</p>
				{ ( isStalled || isOverrun ) && (
					<p className="transfer-wait__overrun" role="status">
						{ isStalled ? stalledCopy : overrunCopy }
					</p>
				) }
			</div>
			<div className="transfer-wait__progress">
				<ProgressBar
					className="transfer-wait__progress-bar"
					value={ overallProgress }
					aria-label={ String( stageTitles[ stageKey ] ) }
				/>
				{ showEscape && (
					<Button
						className="transfer-wait__escape"
						variant="link"
						href={ isPluginInstall ? `/plugins/${ siteSlug }` : `/sites/${ siteSlug }` }
						onClick={ () =>
							recordTracksEvent( 'calypso_transfer_wait_stalled_click', {
								wait_type: waitType,
								...( productSlug ? { product_slug: productSlug } : {} ),
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
						icon: isPluginInstall ? 'plugins' : 'checkmark',
						text: finalChecklistText,
					},
				] }
			/>
		</div>
	);
}
