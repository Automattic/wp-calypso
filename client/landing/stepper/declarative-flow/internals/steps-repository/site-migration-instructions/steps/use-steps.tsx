import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MaybeLink } from './maybe-link';
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

interface Options {
	fromUrl: string;
}

interface Step {
	task: Task;
	expandable?: Expandable;
}

type Steps = Step[];

export const useSteps = ( { fromUrl }: Options ): Steps => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 0 );

	const steps = [
		{
			title: translate( 'Install the Migrate Guru plugin' ),
			content: (
				<p>
					{ translate(
						'First you’ll need to install and activate the {{a}}Migrate Guru plugin{{/a}} on the site you want to migrate. Click next when you’re ready.',
						{
							components: {
								a: (
									<a
										href={ getPluginInstallationPage( fromUrl ) }
										target="_blank"
										rel="noreferrer noopener"
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
							'Head to the {{a}}Migrate Guru page on the site you’re migrating{{/a}}, Tap in your email address and click {{strong}}‘%(migrateLabel)s’{{/strong}}.',
							{
								components: {
									strong: <strong />,
									a: (
										<MaybeLink
											href={ fromUrl ? getMigrateGuruPageURL( fromUrl ) : undefined }
											target="_blank"
											rel="noreferrer noopener"
											fallback={ <strong /> }
											onClick={ () => recordInstructionsLinkClick( 'go-to-plugin-page' ) }
										/>
									),
								},
								args: { migrateLabel: 'Migrate' },
							}
						) }
					</p>
					<p>
						<strong>{ translate( 'Then, pick WordPress.com as your destination host.' ) }</strong>
					</p>
					<p>{ translate( 'All set? Click next below.' ) }</p>
				</>
			),
		},
		{
			title: translate( 'Add your migration key' ),
			content: (
				<p>
					{ translate(
						'Copy and paste the migration key below in the Migrate Guru Migration key field and click {{strong}}%(migrateLabel)s{{/strong}}.',

						{
							components: {
								strong: <strong />,
							},
							args: { migrateLabel: 'Migrate' },
						}
					) }
				</p>
			),
		},
	];

	return steps.map( ( step, index ) => {
		return {
			task: {
				id: step.title,
				title: step.title,
				completed: currentStep > index,
				disabled: false,
			},
			expandable: {
				content: step.content,
				isOpen: currentStep === index,
				action: {
					label: index === steps.length - 1 ? translate( 'Done' ) : translate( 'Next' ),
					onClick: () => {
						// TODO: Done should navigate to the next flow step.
						setCurrentStep( index + 1 );
					},
				},
			},
		};
	} );
};
