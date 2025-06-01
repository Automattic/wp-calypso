import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MigrationKeyCta } from './migration-key-cta';
import { StepAddMigrationKey } from './step-add-migration-key';
import { StepAddMigrationKeyFallback } from './step-add-migration-key-fallback';
import { StepButton } from './step-button';
import { StepGetYourSiteReady } from './step-get-your-site-ready';
import { StepInstallMigrationPlugin } from './step-install-migration-plugin';
import { StepLinkCta } from './step-link-cta';
import { getMigrationPluginPageURL, getMigrationPluginInstallURL } from './utils';
import type { Task, Expandable } from '@automattic/launchpad';

const INSTALL_MIGRATION_PLUGIN = 'install-the-migrate-plugin';
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
	title: string | React.ReactNode;
	content: JSX.Element;
	action?: JSX.Element;
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
			key: INSTALL_MIGRATION_PLUGIN,
			title: translate( 'Install the %(pluginName)s plugin', {
				args: {
					pluginName: 'Migrate to WordPress.com',
				},
			} ),
			content: <StepInstallMigrationPlugin />,
			action: (
				<StepLinkCta url={ getMigrationPluginInstallURL( fromUrl ) } linkname="install-plugin">
					{ translate( 'Install plugin' ) }
				</StepLinkCta>
			),
		},
		{
			key: GET_SITE_READY,
			title: translate( 'Get your site ready' ),
			content: <StepGetYourSiteReady />,
			action: fromUrl ? (
				<StepLinkCta url={ getMigrationPluginPageURL( fromUrl ) } linkname="go-to-plugin-page">
					{ translate( 'Get started' ) }
				</StepLinkCta>
			) : undefined,
		},
		{
			key: ADD_MIGRATION_KEY,
			title: translate( 'Add your migration key' ),
			content: showMigrationKeyFallback ? (
				<StepAddMigrationKeyFallback />
			) : (
				<StepAddMigrationKey migrationKey={ migrationKey } preparationError={ preparationError } />
			),
			action: showMigrationKeyFallback ? <MigrationKeyCta /> : undefined,
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

		let navigationAction = undefined;
		const navigationButtonVariant = step.action ? 'secondary' : 'primary';
		const isMigrationKeyStep = index === array.length - 1;

		if ( isMigrationKeyStep ) {
			// Show the Done button if there's a migration key OR if the fallback text is displayed.
			// If neither are true, then the migration key is still being generated.
			if ( migrationKey || showMigrationKeyFallback ) {
				navigationAction = (
					<StepButton variant={ navigationButtonVariant } onClick={ onDoneClick }>
						{ translate( 'Done' ) }
					</StepButton>
				);
			}
		} else {
			navigationAction = (
				<StepButton variant={ navigationButtonVariant } onClick={ onNextClick }>
					{ translate( 'Next' ) }
				</StepButton>
			);
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
							{ step.action }
							{ navigationAction }
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
