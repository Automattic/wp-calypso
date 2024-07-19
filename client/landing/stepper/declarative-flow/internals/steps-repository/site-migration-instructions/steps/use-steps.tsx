import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MigrationKeyInput } from '../migration-key-input';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import type { Task, Expandable, ExpandableAction } from '@automattic/launchpad';

const removeDuplicatedSlashes = ( url: string ) => url.replace( /(https?:\/\/)|(\/)+/g, '$1$2' );

const getPluginInstallationPage = ( fromUrl: string ) => {
	if ( fromUrl !== '' ) {
		return removeDuplicatedSlashes(
			`${ fromUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`
		);
	}

	return 'https://wordpress.org/plugins/migrate-guru/';
};

const getMigrateGuruPageURL = ( siteURL: string ) =>
	removeDuplicatedSlashes( `${ siteURL }/wp-admin/admin.php?page=migrateguru` );

interface StepsDataOptions {
	fromUrl: string;
	migrationKey: string;
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

const useStepsData = ( { fromUrl, migrationKey }: StepsDataOptions ): StepsData => {
	const translate = useTranslate();

	return [
		{
			key: 'install-the-migrate-guru-plugin',
			title: translate( 'Install the Migrate Guru plugin' ),
			content: (
				<p>
					{ translate(
						"First you'll need to install and activate the {{a}}Migrate Guru plugin{{/a}} on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
						{
							components: {
								strong: <strong />,
								a: (
									<ExternalLink
										href={ getPluginInstallationPage( fromUrl ) }
										icon
										iconSize={ 14 }
										target="_blank"
										onClick={ () => recordMigrationInstructionsLinkClick( 'install-plugin' ) }
									/>
								),
							},
						}
					) }
				</p>
			),
		},
		{
			key: 'get-your-site-ready',
			title: translate( 'Get your site ready' ),
			content: (
				<>
					<p>
						{ translate(
							'Head to the {{a}}Migrate Guru plugin screen on your source site{{/a}}, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
							{
								components: {
									strong: <strong />,
									a: fromUrl ? (
										<ExternalLink
											href={ getMigrateGuruPageURL( fromUrl ) }
											icon
											iconSize={ 14 }
											target="_blank"
											onClick={ () => recordMigrationInstructionsLinkClick( 'go-to-plugin-page' ) }
										/>
									) : (
										<strong />
									),
								},
								args: { migrateLabel: 'Migrate' },
							}
						) }
					</p>
					<p>{ translate( 'Then, pick WordPress.com as your destination host.' ) }</p>
					<p>
						{ translate( 'All set? Click {{strong}}Next{{/strong}} below.', {
							components: {
								strong: <strong />,
							},
						} ) }
					</p>
				</>
			),
		},
		{
			key: 'add-your-migration-key',
			title: translate( 'Add your migration key' ),
			content:
				'' === migrationKey ? (
					<>
						<p>{ translate( 'The key will be available here when your new site is ready.' ) }</p>
						<div className="migration-key-placeholder" />
					</>
				) : (
					<>
						<p>
							{ translate(
								'Copy the key below. Head to the Migrate Guru settings on your source site, and paste it into the {{strong}}%(migrationKeyLabel)s{{/strong}} field.',
								{
									components: {
										strong: <strong />,
									},
									args: { migrationKeyLabel: 'Migrate Guru Migration Key' },
								}
							) }
						</p>
						<p>
							{ translate( 'Click {{strong}}%(migrateLabel)s{{/strong}} to finish.', {
								components: {
									strong: <strong />,
								},
								args: { migrateLabel: 'Migrate' },
							} ) }
						</p>
						<MigrationKeyInput value={ migrationKey } />
					</>
				),
		},
	];
};

export const useSteps = ( { fromUrl, migrationKey, onComplete }: StepsOptions ): StepsObject => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const stepsData = useStepsData( { fromUrl, migrationKey } );

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
		} else if ( migrationKey ) {
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
				disabled: false,
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
