import { StepContainer } from '@automattic/onboarding';
import { FetchStatus } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { type FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { usePluginAutoInstallation } from 'calypso/landing/stepper/hooks/use-plugin-auto-installation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteMigrationKey } from 'calypso/landing/stepper/hooks/use-site-migraiton-key';
import { useSiteMigrationTransfer } from 'calypso/landing/stepper/hooks/use-site-migration-transfer';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MaybeLink } from '../site-migration-instructions/maybe-link';
import { ShowHideInput } from '../site-migration-instructions/show-hide-input';
import { PendingActions } from './pending-actions';
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

const PLUGIN = { name: 'migrate-guru/migrateguru', slug: 'migrate-guru' };

type Status = 'idle' | 'pending' | 'success' | 'error';

const getMigrationKeyStatus = (
	migrationKey: string | null | undefined,
	status: FetchStatus,
	error: Error | null
): Status => {
	if ( migrationKey ) {
		return 'success';
	}
	if ( status === 'fetching' ) {
		return 'pending';
	}

	if ( error ) {
		return 'error';
	}

	return status as Status;
};

const useSiteMigration = ( siteId?: number ) => {
	const siteTransferState = useSiteMigrationTransfer( siteId );
	const pluginInstallationState = usePluginAutoInstallation( PLUGIN, siteId, {
		enabled: Boolean( siteTransferState.completed ),
	} );

	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		fetchStatus: migrationKeyFetchStatus,
	} = useSiteMigrationKey( siteId, {
		enabled: Boolean( pluginInstallationState.completed ),
	} );

	const completed = siteTransferState.completed && pluginInstallationState.completed;
	const error = siteTransferState.error || pluginInstallationState.error || migrationKeyError;

	const detailedStatus = {
		siteTransfer: siteTransferState.status,
		pluginInstallation: pluginInstallationState.status,
		migrationKey: ! pluginInstallationState.completed
			? 'idle'
			: getMigrationKeyStatus( migrationKey, migrationKeyFetchStatus, migrationKeyError ),
	};

	return {
		detailedStatus,
		completed,
		error,
		migrationKey,
		failedToGetMigrationKey: !! migrationKeyError,
	};
};

const SiteMigrationInstructions: Step = function () {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID;
	const fromUrl = useQuery().get( 'from' ) || '';
	const {
		detailedStatus,
		migrationKey,
		completed: isSetupCompleted,
		failedToGetMigrationKey,
	} = useSiteMigration( siteId );

	const showFallback = isSetupCompleted && failedToGetMigrationKey;
	const showCopyIntoNewSite = isSetupCompleted && migrationKey;

	const stepContent = (
		<div className="site-migration-instructions__content">
			<ol className="site-migration-instructions__list">
				<li>
					{ translate(
						'Install and activate the {{a}}Migrate Guru plugin{{/a}} on your existing site.',
						{
							components: {
								a: (
									<a
										href={ getPluginInstallationPage( fromUrl ) }
										target="_blank"
										rel="noreferrer"
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
						className={ classNames( 'fade-in', {
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
						className={ classNames( 'fade-in', {
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
			<p
				className={ classNames( 'fade-in', {
					active: showFallback,
				} ) }
			>
				{ translate(
					'And you are done! When the migration finishes, Migrate Guru will send you an email.'
				) }
			</p>
		</div>
	);

	return (
		<>
			<DocumentHead title={ translate( 'Migrate your site' ) } />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions"
				hideSkip={ true }
				hideBack={ true }
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
