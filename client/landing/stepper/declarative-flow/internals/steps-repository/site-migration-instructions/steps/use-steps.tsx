import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Task, Expandable } from '@automattic/launchpad';

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

const recordInstructionsLinkClick = ( linkname: string ) => {
	recordTracksEvent( 'calypso_site_migration_instructions_link_click', {
		linkname,
	} );
};

interface StepsDataOptions {
	fromUrl: string;
}

interface StepData {
	title: string;
	content: JSX.Element;
}

type StepsData = StepData[];

interface StepsOptions {
	fromUrl: string;
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

const useStepsData = ( { fromUrl }: StepsDataOptions ): StepsData => {
	const translate = useTranslate();

	return [
		{
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
										target="_blank"
										onClick={ () => recordInstructionsLinkClick( 'install-plugin' ) }
									/>
								),
							},
						}
					) }
				</p>
			),
		},
		{
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
											target="_blank"
											onClick={ () => recordInstructionsLinkClick( 'go-to-plugin-page' ) }
										/>
									) : (
										<strong />
									),
								},
								args: { migrateLabel: 'Migrate' },
							}
						) }
					</p>
					<p>
						<strong>{ translate( 'Then, pick WordPress.com as your destination host.' ) }</strong>
					</p>
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
			title: translate( 'Add your migration key' ),
			content: (
				<>
					<p>
						{ translate(
							'Copy the key below. Head to the Migrate Guru settings on your source site, and paste it into the {{strong}}Migration key{{/strong}} field.',
							{
								components: {
									strong: <strong />,
								},
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
				</>
			),
		},
	];
};

export const useSteps = ( { fromUrl, onComplete }: StepsOptions ): StepsObject => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const stepsData = useStepsData( { fromUrl } );

	const steps: Steps = stepsData.map( ( step, index, array ) => {
		const onActionClick = () => {
			setCurrentStep( index + 1 );

			// When completing a step that wasn't completed yet.
			if ( lastCompleteStep < index ) {
				setLastCompleteStep( index );
			}

			// When clicking on the last step.
			if ( index === array.length - 1 ) {
				onComplete();
			}
		};

		// Allow clicking on already completed steps only, so users can see the previous steps again.
		const onItemClick =
			index > lastCompleteStep || index === currentStep
				? undefined
				: () => {
						setCurrentStep( index );
				  };

		return {
			task: {
				id: step.title,
				title: step.title,
				completed: lastCompleteStep >= index,
				disabled: false,
			},
			expandable: {
				content: step.content,
				isOpen: currentStep === index,
				action: {
					label: index === array.length - 1 ? translate( 'Done' ) : translate( 'Next' ),
					onClick: onActionClick,
				},
			},
			onClick: onItemClick,
		};
	} );

	return {
		steps,
		completedSteps: lastCompleteStep + 1,
	};
};
