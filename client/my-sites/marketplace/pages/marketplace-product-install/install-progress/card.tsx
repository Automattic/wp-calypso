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
export default function InstallProgressCard( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const translate = useTranslate();
	const { stage, isOverrun, overallProgress } = useInstallProgress( {
		transferStatus,
		currentStep,
		startedAt,
	} );
	const stageKey = INSTALL_STAGES[ stage ].key;
	const stageTitles = useStageTitles();
	const sentences = useStageSentences();
	const overrunCopy = useOverrunCopy();

	return (
		<div className="marketplace-install-progress">
			<div className="marketplace-install-progress__header">
				<Step.Heading text={ translate( 'Setting up your plugin' ) } align="center" />
				<p className="marketplace-install-progress__stage" role="status">
					{ sentences[ stageKey ] }
				</p>
				{ isOverrun && (
					<p className="marketplace-install-progress__overrun" role="status">
						{ overrunCopy }
					</p>
				) }
			</div>
			<div className="marketplace-install-progress__progress">
				<ProgressBar
					className="marketplace-install-progress__progress-bar"
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
