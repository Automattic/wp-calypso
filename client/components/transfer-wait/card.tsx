import './style.scss';

import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ExpectationChecklist from 'calypso/components/expectation-checklist';
import { useOverrunCopy, useStageSentences, useStageTitles } from './copy';
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
}: {
	transferStatus: string | null;
	fallbackStep?: number;
	startedAt?: number | null;
	isPluginInstall?: boolean;
} ) {
	const translate = useTranslate();
	const { stage, isOverrun, overallProgress } = useInstallProgress( {
		transferStatus,
		fallbackStep,
		startedAt,
	} );
	const stageKey = INSTALL_STAGES[ stage ].key;
	const stageTitles = useStageTitles();
	const sentences = useStageSentences( isPluginInstall );
	const overrunCopy = useOverrunCopy();
	const heading = isPluginInstall
		? translate( 'Setting up your plugin' )
		: translate( 'Setting up your site' );
	const finalChecklistText = isPluginInstall
		? translate( 'Your plugin is installed and activated automatically once the server is ready.' )
		: translate( 'Your site is ready to use once the transfer is complete.' );

	return (
		<div className="transfer-wait">
			<div className="transfer-wait__header">
				<Step.Heading text={ heading } align="center" />
				<p className="transfer-wait__stage" role="status">
					{ sentences[ stageKey ] }
				</p>
				{ isOverrun && (
					<p className="transfer-wait__overrun" role="status">
						{ overrunCopy }
					</p>
				) }
			</div>
			<div className="transfer-wait__progress">
				<ProgressBar
					className="transfer-wait__progress-bar"
					value={ overallProgress }
					aria-label={ String( stageTitles[ stageKey ] ) }
				/>
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
