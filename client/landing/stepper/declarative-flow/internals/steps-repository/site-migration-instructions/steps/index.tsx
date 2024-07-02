import { Checklist, ChecklistItem } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MaybeLink } from './maybe-link';

interface Props {
	fromUrl: string;
}

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

export const Steps: FC< Props > = ( { fromUrl } ) => {
	const translate = useTranslate();

	const checklistItems = [
		{
			task: {
				id: '1',
				title: translate( '1. Install the Migrate Guru plugin' ),
				completed: false,
				disabled: false,
			},
			expandable: {
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
				isOpen: true,
				action: {
					label: translate( 'Next' ),
					onClick: () => {},
				},
			},
		},
		{
			task: {
				id: '2',
				title: translate( '2. Get your site ready' ),
				completed: false,
				disabled: false,
			},
			expandable: {
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
				isOpen: true,
				action: {
					label: translate( 'Next' ),
					onClick: () => {},
				},
			},
		},
		{
			task: {
				id: '3',
				title: translate( '3. Add your migration key' ),
				completed: false,
				disabled: false,
			},
			expandable: {
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
				isOpen: true,
				action: {
					label: translate( 'Done' ),
					onClick: () => {},
				},
			},
		},
	];

	return (
		<Checklist>
			{ checklistItems.map( ( props ) => (
				<ChecklistItem key={ props.task.id } { ...props } />
			) ) }
		</Checklist>
	);
};
