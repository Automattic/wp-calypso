import './style.scss';

import { ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ExpectationChecklist from 'calypso/components/expectation-checklist';
import { useHonestFooterCopy, useHonestStageCopy, useHonestStageSentences } from './copy';
import { useHonestProgress } from './use-honest-progress';

/**
 * The design-approved honest wait: a heading, one sentence naming the stage the transfer is
 * actually in, a single real overall bar, and the “what to expect” card. Same honest clock as
 * the other variants — the bar is fed by confirmed stages, never a timer.
 */
export default function HonestInstallCard( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const translate = useTranslate();
	const { stage, isOverrun, overallProgress } = useHonestProgress( {
		transferStatus,
		currentStep,
		startedAt,
	} );
	const stages = useHonestStageCopy();
	const sentences = useHonestStageSentences();
	const footer = useHonestFooterCopy();

	return (
		<div className="marketplace-honest-progress marketplace-honest-card">
			<div className="marketplace-honest-card__header">
				<h1 className="marketplace-honest-progress__heading wp-brand-font">
					{ translate( 'Setting up your plugin' ) }
				</h1>
				<p className="marketplace-honest-card__stage" role="status">
					{ sentences[ stage ] }
				</p>
				{ isOverrun && (
					<p className="marketplace-honest-card__overrun" role="status">
						{ footer.overrun }
					</p>
				) }
			</div>
			<div className="marketplace-honest-card__progress">
				<ProgressBar
					className="marketplace-honest-card__progress-bar"
					value={ overallProgress }
					aria-label={ String( stages[ stage ].title ) }
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
