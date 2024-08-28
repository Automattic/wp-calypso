import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { StepAddMigrationKey } from './step-add-migration-key';
import { StepAddMigrationKeyFallback } from './step-add-migration-key-fallback';
import { StepCta } from './step-cta';
import { StepGetYourSiteReady } from './step-get-your-site-ready';
import { StepInstallMigrateGuru } from './step-install-migrate-guru';
import { getMigrateGuruPageURL, getPluginInstallationPage } from './utils';
import type { Task, Expandable } from '@automattic/launchpad';

const INSTALL_MIGRATE_GURU = 'install-the-migrate-guru-plugin';
const GET_SITE_READY = 'get-your-site-ready';
const ADD_MIGRATION_KEY = 'add-your-migration-key';

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
	actionCtaText: string;
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

	let migrationKeyActionCtaText = '';

	if ( fromUrl ) {
		if ( migrationKey ) {
			migrationKeyActionCtaText = translate( 'Enter key' );
		} else {
			migrationKeyActionCtaText = translate( 'Get key' );
		}
	}

	return [
		{
			key: INSTALL_MIGRATE_GURU,
			title: translate( 'Install the Migrate Guru plugin' ),
			content: <StepInstallMigrateGuru />,
			actionCtaText: translate( 'Install plugin' ),
		},
		{
			key: GET_SITE_READY,
			title: translate( 'Get your site ready' ),
			content: <StepGetYourSiteReady />,
			actionCtaText: fromUrl && translate( 'Get started' ),
		},
		{
			key: ADD_MIGRATION_KEY,
			title: translate( 'Add your migration key' ),
			content: showMigrationKeyFallback ? (
				<StepAddMigrationKeyFallback />
			) : (
				<StepAddMigrationKey migrationKey={ migrationKey } preparationError={ preparationError } />
			),
			actionCtaText: migrationKeyActionCtaText,
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
	const site = useSite();
	const siteUrl = site?.URL ?? '';
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

		const openPluginInstallationPage = () => {
			window.open( getPluginInstallationPage( fromUrl ), '_blank' );
			recordMigrationInstructionsLinkClick( 'install-plugin' );
		};

		const openMigrateGuruPage = ( url: string, linkname: string ) => {
			window.open( getMigrateGuruPageURL( url ), '_blank' );
			recordMigrationInstructionsLinkClick( linkname );
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

		let navigationCtaText = translate( 'Next' );
		let onNavigationCtaClick = onNextClick;
		let onActionCtaClick = openPluginInstallationPage;

		if ( isMigrationKeyStep ) {
			if ( migrationKey ) {
				onActionCtaClick = () => openMigrateGuruPage( fromUrl, 'enter-key' );
			} else {
				onActionCtaClick = () => openMigrateGuruPage( siteUrl, 'copy-key-fallback' );
			}

			navigationCtaText = translate( 'Done' );
			onNavigationCtaClick = onDoneClick;
		} else if ( 1 === index ) {
			onActionCtaClick = () => openMigrateGuruPage( fromUrl, 'go-to-plugin-page' );
		}

		return {
			task: {
				id: step.key,
				title: step.title,
				completed: lastCompleteStep >= index,
				disabled: lastCompleteStep < index - 1,
			},
			expandable: {
				content: (
					<>
						{ step.content }

						<div className="checklist-item__checklist-expanded-ctas">
							{ step.actionCtaText && (
								<>
									<StepCta
										text={ step.actionCtaText }
										variant="primary"
										onClick={ onActionCtaClick }
									/>
									<StepCta
										text={ navigationCtaText }
										variant="secondary"
										onClick={ onNavigationCtaClick }
									/>
								</>
							) }

							{ ! step.actionCtaText && (
								<StepCta
									text={ navigationCtaText }
									variant="primary"
									onClick={ onNavigationCtaClick }
								/>
							) }
						</div>
					</>
				),
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
