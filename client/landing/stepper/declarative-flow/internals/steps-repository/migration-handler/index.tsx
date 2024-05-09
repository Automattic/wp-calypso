import { StepContainer, Title } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import NotAuthorized from 'calypso/blocks/importer/components/not-authorized';
import { addProtocolToUrl } from 'calypso/blocks/importer/util';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { SITE_PICKER_FILTER_CONFIG } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { triggerMigrationStartingEvent } from 'calypso/my-sites/migrate/helpers';
import type { Step } from '../../types';
import type { UserSelect } from '@automattic/data-stores';
import './styles.scss';

const MigrationHandler: Step = function MigrationHandler( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const { setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );
	const [ isUnAuthorized, setIsUnAuthorized ] = useState( false );
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const { data: sites } = useSiteExcerptsQuery(
		SITE_PICKER_FILTER_CONFIG,
		( site ) => ! site.is_deleted
	);
	const { data: sourceSiteMigrationStatus, isError: isErrorSourceSiteMigrationStatus } =
		useSourceMigrationStatusQuery( sourceSiteSlug );

	useEffect( () => {
		setIsMigrateFromWp( true );
	}, [] );

	useEffect( () => {
		if ( isErrorSourceSiteMigrationStatus ) {
			setIsUnAuthorized( true );
		}
	}, [ isErrorSourceSiteMigrationStatus ] );

	useEffect( () => {
		if ( ! submit || ! sourceSiteMigrationStatus || isErrorSourceSiteMigrationStatus || ! sites ) {
			return;
		}

		const migrationFlow = 'MtWplugin';
		triggerMigrationStartingEvent( currentUser, migrationFlow );

		submit( {
			isFromMigrationPlugin: true,
			status: sourceSiteMigrationStatus?.status,
			targetBlogId: sourceSiteMigrationStatus?.target_blog_id,
			isAdminOnTarget: sourceSiteMigrationStatus?.is_target_blog_admin,
			isTargetBlogUpgraded: sourceSiteMigrationStatus?.is_target_blog_upgraded,
			targetBlogSlug: sourceSiteMigrationStatus?.target_blog_slug,
			userHasSite: sites && sites.length > 0,
		} );
	}, [ isErrorSourceSiteMigrationStatus, sourceSiteMigrationStatus, sites ] );

	const getCurrentMessage = () => {
		return __( 'Scanning your site' );
	};

	const renderContent = () => {
		if ( isUnAuthorized ) {
			return (
				<NotAuthorized
					type="source-site-not-connected-move-plugin"
					sourceSiteUrl={ addProtocolToUrl( sourceSiteSlug ) }
					startImport={ () => window.location.reload() }
				/>
			);
		}
		return (
			<div className="import-layout__center">
				<div className="import__header import__loading">
					<Title>{ getCurrentMessage() }</Title>
					<LoadingEllipsis />
				</div>
			</div>
		);
	};

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				isWideLayout
				stepName="migration-handler"
				recordTracksEvent={ recordTracksEvent }
				stepContent={ renderContent() }
				showFooterWooCommercePowered={ false }
				className="import__onboarding-page"
			/>
		</>
	);
};

export default MigrationHandler;
