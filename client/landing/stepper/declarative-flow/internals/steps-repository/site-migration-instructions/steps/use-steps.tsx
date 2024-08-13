import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { StepAddMigrationKey } from './step-add-migration-key';
import { StepAddMigrationKeyFallback } from './step-add-migration-key-fallback';
import { StepGetYourSiteReady } from './step-get-your-site-ready';
import { StepInstallMigrateGuru } from './step-install-migrate-guru';
import type { Task, Expandable } from '@automattic/launchpad';

const INSTALL_MIGRATE_GURU = 'install-the-migrate-guru-plugin';
const GET_SITE_READY = 'get-your-site-ready';
const ADD_MIGRATION_KEY = 'add-your-migration-key';

interface StepsDataOptions {
	fromUrl: string;
	lastCompleteStep: number;
	migrationKey: string;
	onComplete: () => void;
	preparationError: Error | null;
	setCurrentStep: () => void;
	setLastCompleteStep: () => void;
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
	lastCompleteStep,
	migrationKey,
	onComplete,
	preparationError,
	setCurrentStep,
	setLastCompleteStep,
	showMigrationKeyFallback,
}: StepsDataOptions ): StepsData => {
	const translate = useTranslate();

	const recordCompletedStepEvent = ( key ) => {
		recordTracksEvent( 'calypso_site_migration_instructions_substep_complete', {
			step: key,
		} );
	};

	const onNextClick = ( index, key ) => {
		setCurrentStep( index + 1 );

		// When completing a step that wasn't completed yet.
		if ( lastCompleteStep < index ) {
			setLastCompleteStep( index );
			recordCompletedStepEvent( key );
		}
	};

	const onDoneClick = ( key ) => {
		onComplete();
		recordCompletedStepEvent( key );
	};

	const steps = [
		{
			key: INSTALL_MIGRATE_GURU,
			title: translate( 'Install the Migrate Guru plugin' ),
			content: (
				<StepInstallMigrateGuru
					fromUrl={ fromUrl }
					onNextClick={ () => onNextClick( 0, INSTALL_MIGRATE_GURU ) }
				/>
			),
		},
		{
			key: GET_SITE_READY,
			title: translate( 'Get your site ready' ),
			content: (
				<StepGetYourSiteReady
					fromUrl={ fromUrl }
					onNextClick={ () => onNextClick( 1, GET_SITE_READY ) }
				/>
			),
		},
		{
			key: ADD_MIGRATION_KEY,
			title: translate( 'Add your migration key' ),
			content: showMigrationKeyFallback ? (
				<StepAddMigrationKeyFallback onDoneClick={ () => onDoneClick( ADD_MIGRATION_KEY ) } />
			) : (
				<StepAddMigrationKey
					fromUrl={ fromUrl }
					migrationKey={ migrationKey }
					onNextClick={ () => onNextClick( 2, ADD_MIGRATION_KEY ) }
					onDoneClick={ () => onDoneClick( 2 ) }
					preparationError={ preparationError }
				/>
			),
		},
	];

	return steps;
};

export const useSteps = ( {
	fromUrl,
	migrationKey,
	preparationError,
	showMigrationKeyFallback,
	onComplete,
}: StepsOptions ): StepsObject => {
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const stepsData = useStepsData( {
		fromUrl,
		lastCompleteStep,
		migrationKey,
		onComplete,
		preparationError,
		setCurrentStep,
		setLastCompleteStep,
		showMigrationKeyFallback,
	} );

	const steps: Steps = stepsData.map( ( step, index ) => {
		// Allow clicking on visited steps only, so users can see the previous steps again.
		const onItemClick =
			index > lastCompleteStep + 1 || index === currentStep
				? undefined
				: () => {
						setCurrentStep( index );
				  };

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
			},
			onClick: onItemClick,
		};
	} );

	return {
		steps,
		completedSteps: lastCompleteStep + 1,
	};
};
