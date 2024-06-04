import { captureException } from '@automattic/calypso-sentry';
import { StepContainer } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { usePrepareSiteForMigration } from 'calypso/landing/stepper/hooks/use-prepare-site-for-migration';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MaybeLink } from './maybe-link';
import { PendingActions } from './pending-actions';
import { ShowHideInput } from './show-hide-input';
import type { Step } from '../../types';
import './style.scss';

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

const DoNotTranslateIt: FC< { value: string } > = ( { value } ) => <>{ value }</>;

const ContactSupportMessage = () => {
	const translate = useTranslate();

	return (
		<p className="site-migration-instructions__contact">
			{ translate(
				'Sorry, we couldn’t finish setting up your site. {{link}}Please, contact support{{/link}}.',
				{
					components: {
						link: <a href="https://wordpress.com/help/contact" target="_blank" rel="noreferrer" />,
					},
				}
			) }
		</p>
	);
};

const SiteMigrationInstructions: Step = function ( { flow } ) {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID;
	const fromUrl = useQuery().get( 'from' ) || '';
	const {
		detailedStatus,
		migrationKey,
		completed: isSetupCompleted,
		error: setupError,
	} = usePrepareSiteForMigration( siteId );

	const hasErrorGetMigrationKey = detailedStatus.migrationKey === 'error';
	const showCopyIntoNewSite = isSetupCompleted && migrationKey;
	const showSupportMessage = setupError && ! hasErrorGetMigrationKey;
	const showFallback = isSetupCompleted && hasErrorGetMigrationKey;

	useEffect( () => {
		if ( hasErrorGetMigrationKey ) {
			recordTracksEvent(
				'calypso_onboarding_site_migration_instructions_unable_to_get_migration_key',
				{
					from: fromUrl,
				}
			);
		}
	}, [ fromUrl, hasErrorGetMigrationKey ] );

	useEffect( () => {
		if ( isSetupCompleted ) {
			recordTracksEvent( 'calypso_site_migration_instructions_preparation_complete' );
		}
	}, [ isSetupCompleted ] );

	useEffect( () => {
		if ( setupError ) {
			const logError = setupError as unknown as { path: string; message: string };

			captureException( setupError, {
				extra: {
					message: logError?.message,
					path: logError?.path,
				},
				tags: {
					blog_id: siteId,
					calypso_section: 'setup',
					flow,
					stepName: 'site-migration-instructions',
					context: 'failed_to_prepare_site_for_migration',
				},
			} );
		}
	}, [ flow, setupError, siteId ] );

	const recordInstructionsLinkClick = ( linkname: string ) => {
		recordTracksEvent( 'calypso_site_migration_instructions_link_click', {
			linkname,
		} );
	};

	const stepContent = (
		<div className="site-migration-instructions__content">
			<ol className="site-migration-instructions__list">
				<li>
					{ translate(
						'Install and activate the {{a}}Migrate Guru plugin{{/a}} on your source site.',
						{
							components: {
								a: (
									<a
										href={ getPluginInstallationPage( fromUrl ) }
										target="_blank"
										rel="noreferrer"
										onClick={ () => recordInstructionsLinkClick( 'install-plugin' ) }
									/>
								),
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'Go to the {{a}}Migrate Guru page on your source site{{/a}}, enter your email address, and click {{strong}}{{migrateButton /}}{{/strong}}.',
						{
							components: {
								a: (
									<MaybeLink
										href={ fromUrl ? getMigrateGuruPageURL( fromUrl ) : undefined }
										target="_blank"
										rel="noreferrer"
										fallback={ <strong /> }
										onClick={ () => recordInstructionsLinkClick( 'go-to-plugin-page' ) }
									/>
								),
								migrateButton: <DoNotTranslateIt value="Migrate" />,
								strong: <strong />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'When asked to select a destination host, pick {{em}}WordPress.com{{/em}}.',
						{
							components: {
								em: <em />,
							},
						}
					) }
				</li>
				<li>
					<PendingActions status={ detailedStatus } />
				</li>

				{ showCopyIntoNewSite && (
					<li
						className={ clsx( 'fade-in', {
							active: showCopyIntoNewSite,
						} ) }
					>
						{ translate(
							'Copy and paste the migration key below in the {{em}}{{ migrationKeyField /}}{{/em}} field and click {{strong}}{{migrateButton /}}{{/strong}}.',
							{
								components: {
									migrationKeyField: <DoNotTranslateIt value="Migrate Guru Migration key" />,
									migrateButton: <DoNotTranslateIt value="Migrate" />,
									em: <em />,
									strong: <strong />,
								},
							}
						) }
						<ShowHideInput value={ migrationKey! } className="site-migration-instructions__key" />
					</li>
				) }
				{ showFallback && (
					<li
						className={ clsx( 'fade-in', {
							active: showFallback,
						} ) }
					>
						{ translate(
							'Go to the {{a}}Migrate Guru page on the new WordPress.com site{{/a}} and copy the migration key. Then paste it on the {{em}}{{migrationKeyField /}}{{/em}} field of your existing site and click {{strong}}{{migrateButton /}}{{/strong}}.',
							{
								components: {
									a: (
										<a
											href={ getMigrateGuruPageURL( site!.URL ) }
											target="_blank"
											rel="noreferrer"
										/>
									),
									em: <em />,
									strong: <strong />,
									migrationKeyField: <DoNotTranslateIt value="Migrate Guru Migration key" />,
									migrateButton: <DoNotTranslateIt value="Migrate" />,
								},
							}
						) }
					</li>
				) }
			</ol>
			{ showFallback ||
				( showCopyIntoNewSite && (
					<p className={ clsx( 'fade-in', { active: true } ) }>
						{ translate(
							'And you are done! When the migration finishes, Migrate Guru will send you an email.'
						) }
					</p>
				) ) }
			{ showSupportMessage && <ContactSupportMessage /> }
		</div>
	);

	return (
		<>
			<DocumentHead title={ translate( 'Migrate your site' ) } />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions site-migration-instructions-i2"
				hideSkip
				hideBack
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText={ translate( 'Ready to migrate your site?' ) }
						align="center"
						subHeaderText={ translate( 'Follow these steps to get started.' ) }
						subHeaderAlign="center"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
