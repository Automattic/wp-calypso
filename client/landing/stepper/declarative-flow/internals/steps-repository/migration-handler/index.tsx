import { StepContainer, Title } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import NotAuthorized from 'calypso/blocks/importer/components/not-authorized';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { SITE_PICKER_FILTER_CONFIG } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { redirect } from '../import/util';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './styles.scss';

const MigrationHandler: Step = function MigrationHandler( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);
	const { setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );
	const [ isUnAuthorized, setIsUnAuthorized ] = useState( false );
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const onSourceMigrationStatusError = () => {
		setIsUnAuthorized( true );
	};
	const { data: sites } = useSiteExcerptsQuery( SITE_PICKER_FILTER_CONFIG );
	const { data: sourceSiteMigrationStatus, isError: isErrorSourceSiteMigrationStatus } =
		useSourceMigrationStatusQuery( sourceSiteSlug, onSourceMigrationStatusError );

	useEffect( () => {
		setIsMigrateFromWp( true );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		if ( ! submit || ! sourceSiteMigrationStatus || isErrorSourceSiteMigrationStatus || ! sites ) {
			return;
		}

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

	const skipToDashboard = () => {
		recordTracksEvent( 'calypso_importer_migration_skip_to_dashboard' );
		return redirect( '/' );
	};

	const renderContent = () => {
		if ( isUnAuthorized ) {
			return (
				<NotAuthorized
					onStartBuilding={ skipToDashboard }
					onStartBuildingText={ __( 'Skip to dashboard' ) }
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
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				isWideLayout={ true }
				stepName="migration-handler"
				recordTracksEvent={ recordTracksEvent }
				stepContent={ renderContent() }
				stepProgress={ stepProgress }
				showFooterWooCommercePowered={ false }
				className="import__onboarding-page"
			/>
		</>
	);
};

export default MigrationHandler;
