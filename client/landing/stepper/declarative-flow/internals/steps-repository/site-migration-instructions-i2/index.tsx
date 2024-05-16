import { MigrationStatus } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { usePrepareSiteForMigration } from 'calypso/landing/stepper/hooks/use-prepare-site-for-migration';
import { useQuery as useQueryParams } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
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

interface MigrationStatusResponse {
	status: MigrationStatus;
}
const getMigrationStatus = ( siteId: number ): Promise< MigrationStatusResponse > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/migration-status`,
		apiNamespace: 'wpcom/v2',
	} );

type Options = {
	enabled: boolean;
};

const useMigrationStatus = ( siteId?: number, options?: Options ) => {
	return useQuery( {
		queryKey: [ 'migrationStatus', siteId ],
		queryFn: () => getMigrationStatus( siteId! ),
		refetchInterval: 1000,
		select: ( data ) => data.status,
		enabled: Boolean( siteId && ( options?.enabled ?? true ) ),
	} );
};

const MigrationProgress: FC< { status: MigrationStatus } > = () => {
	const translate = useTranslate();

	return (
		<div className="migration-in-progress">
			<h2 className="migration-in-progress__title">
				{ translate( 'We are migrating your site' ) }
			</h2>
			<p>
				{ translate(
					'Feel free to close this window. We’ll email you when your new site is ready.'
				) }
			</p>
			<LoadingEllipsis className="migration-in-progress__loading" />
		</div>
	);
};

const SiteMigrationInstructions: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID;
	const fromUrl = useQueryParams().get( 'from' ) || '';
	const {
		detailedStatus,
		migrationKey,
		completed: isSetupCompleted,
	} = usePrepareSiteForMigration( siteId );

	const hasErrorGetMigrationKey = detailedStatus.migrationKey === 'error';
	const showFallback = isSetupCompleted && hasErrorGetMigrationKey;
	const showCopyIntoNewSite = isSetupCompleted && migrationKey;
	const { data: migrationStatus } = useMigrationStatus( siteId, { enabled: true } );

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
		if ( migrationStatus === MigrationStatus.DONE ) {
			navigation?.submit?.();
		}
	}, [ migrationStatus, navigation ] );

	const instructions = (
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
					active: showFallback || showCopyIntoNewSite,
				} ) }
			>
				{ translate(
					'And you are done! When the migration finishes, Migrate Guru will send you an email.'
				) }
			</p>
		</div>
	);

	const content =
		migrationStatus &&
		[ MigrationStatus.IN_PROGRESS, MigrationStatus.DONE ].includes( migrationStatus ) ? (
			<MigrationProgress status={ migrationStatus } />
		) : (
			instructions
		);

	return (
		<>
			<DocumentHead title={ translate( 'Migrate your site' ) } />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions site-migration-instructions-i2"
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
				stepContent={ content }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
