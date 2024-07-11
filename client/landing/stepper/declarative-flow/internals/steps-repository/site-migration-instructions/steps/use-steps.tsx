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
			title: translate( 'Install the Migrate Guru plugin' ),
			content: (
				<p>
					{ translate(
						"First you'll need to install and activate the {{a}}Migrate Guru plugin{{/a}} on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
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
			title: translate( 'Get your site ready' ),
			content: (
				<>
					<p>
						{ translate(
							'Head to the {{a}}Migrate Guru plugin screen on your source site{{/a}}, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
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
