import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { StepAddMigrationKey } from './step-add-migration-key';
import { StepAddMigrationKeyFallback } from './step-add-migration-key-fallback';
import { StepGetYourSiteReady } from './step-get-your-site-ready';
import { StepInstallMigrationGuru } from './step-install-migation-guru';
import type { Task, Expandable, ExpandableAction } from '@automattic/launchpad';

interface StepsDataOptions {
	fromUrl: string;
	migrationKey: string;
	preparationError: Error | null;
	showMigrationKeyFallback: boolean;
}

interface StepData {
	key: string;
	title: string;
	content: JSX.Element;
}

type StepsData = StepData[];

interface StepsOptions {
	fromUrl: string;
	migrationKey: string;
	preparationError: Error | null;
	showMigrationKeyFallback: boolean;
	onComplete: () => void;
}

interface Step {
	task: Task;
	expandable?: Expandable;
	onClick?: () => void;
}

export type Steps = Step[];

interface StepsObject {
	steps: Steps;
	completedSteps: number;
}

const useStepsData = ( {
	fromUrl,
	migrationKey,
	preparationError,
	showMigrationKeyFallback,
}: StepsDataOptions ): StepsData => {
	const translate = useTranslate();

	return [
		{
			key: 'install-the-migrate-guru-plugin',
			title: translate( 'Install the Migrate Guru plugin' ),
			content: <StepInstallMigrationGuru fromUrl={ fromUrl } />,
		},
		{
			key: 'get-your-site-ready',
			title: translate( 'Get your site ready' ),
			content: <StepGetYourSiteReady fromUrl={ fromUrl } />,
		},
		{
			key: 'add-your-migration-key',
			title: translate( 'Add your migration key' ),
			content: showMigrationKeyFallback ? (
				<StepAddMigrationKeyFallback />
			) : (
				<StepAddMigrationKey migrationKey={ migrationKey } preparationError={ preparationError } />
			),
		},
	];
};

export const useSteps = ( {
	fromUrl,
	migrationKey,
	preparationError,
	showMigrationKeyFallback,
	onComplete,
}: StepsOptions ): StepsObject => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const stepsData = useStepsData( {
		fromUrl,
		migrationKey,
		preparationError,
		showMigrationKeyFallback,
	} );

	const steps: Steps = stepsData.map( ( step, index, array ) => {
		const recordCompletedStepEvent = () => {
			recordTracksEvent( 'calypso_site_migration_instructions_substep_complete', {
				step: step.key,
			} );
		};

		const onNextClick = () => {
			setCurrentStep( index + 1 );

			// When completing a step that wasn't completed yet.
			if ( lastCompleteStep < index ) {
				setLastCompleteStep( index );
				recordCompletedStepEvent();
			}
		};

		const onDoneClick = () => {
			onComplete();
			recordCompletedStepEvent();
		};

		// Allow clicking on visited steps only, so users can see the previous steps again.
		const onItemClick =
			index > lastCompleteStep + 1 || index === currentStep
				? undefined
				: () => {
						setCurrentStep( index );
				  };

		const isMigrationKeyStep = index === array.length - 1;

		let action: ExpandableAction | undefined;

		if ( ! isMigrationKeyStep ) {
			// Next action.
			action = {
				label: translate( 'Next' ),
				onClick: onNextClick,
			};
		} else if ( migrationKey || showMigrationKeyFallback ) {
			// Done action for the migration key step.
			action = {
				label: translate( 'Done' ),
				onClick: onDoneClick,
			};
		} else {
			// No action for migration key step when migration key is not available.
			action = undefined;
		}

		return {
			task: {
				id: step.key,
				title: step.title,
				completed: lastCompleteStep >= index,
				disabled: lastCompleteStep < index - 1,
			},
			expandable: {
				content: step.content,
				isOpen: currentStep === index,
				action,
			},
			onClick: onItemClick,
		};
	} );

	return {
		steps,
		completedSteps: lastCompleteStep + 1,
	};
};
