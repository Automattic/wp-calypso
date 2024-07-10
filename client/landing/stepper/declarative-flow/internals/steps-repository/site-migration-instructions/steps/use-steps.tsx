import { useTranslate } from 'i18n-calypso';
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

	const steps = [
		{
			title: translate( 'Migrate Guru plugin' ),
			content: (
				<p>
					{ translate(
						'Install and activate the {{a}}Migrate Guru plugin{{/a}} on your site. Once done, click {{strong}}Next{{/strong}} to progress.',
						{
							components: {
								strong: <strong />,
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
			title: translate( 'Set up migration key' ),
			content: (
				<>
					<p>
						{ translate(
							'Go to the {{a}}Migrate Guru page on your source site{{/a}}, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
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
						<strong>
							{ translate( 'When asked to select a destination host, pick WordPress.com' ) }
						</strong>
					</p>
					<p>
						{ translate(
							'Once you have selected WordPress.com, come back here and click {{strong}}Next{{/strong}}.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
				</>
			),
		},
		{
			title: translate( 'Enter your migration Key' ),
			content: (
				<p>
					{ translate(
						'Paste the migration key below in Migrate Guru’s Migration key field and click {{strong}}%(migrateLabel)s{{/strong}}.',
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
				completed: false,
				disabled: false,
			},
			expandable: {
				content: step.content,
				isOpen: true,
				action: {
					label: index === steps.length - 1 ? translate( 'Done' ) : translate( 'Next' ),
					onClick: () => {},
				},
			},
		};
	} );
};
