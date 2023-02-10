import { SiteDetails, SourceSiteMigrationDetails } from '@automattic/data-stores/src/site';
import { StepContainer, Title } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import './styles.scss';

const MigrationHandler: Step = function MigrationHandler( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );
	const { setPendingAction, setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );

	function getSite( sourceSiteSlug: string ) {
		return wpcomRequest< SiteDetails >( {
			path: '/sites/' + encodeURIComponent( sourceSiteSlug as string ),
			apiVersion: '1.1',
		} );
	}

	function getSourceSiteData( sourceId: number ): Promise< SourceSiteMigrationDetails > {
		return wpcom.req.get( {
			path: '/migrations/from-source/' + encodeURIComponent( sourceId as number ),
			apiNamespace: 'wpcom/v2',
		} );
	}

	async function fetchSourceMigrationStatus() {
		const search = window.location.search;
		const sourceSiteSlug = new URLSearchParams( search ).get( 'from' ) || '';
		try {
			const sourceSiteInfo = await getSite( sourceSiteSlug );
			const sourceSiteMigrationStatus = await getSourceSiteData( sourceSiteInfo?.ID );

			return {
				isFromMigrationPlugin: true,
				status: sourceSiteMigrationStatus?.status,
				targetBlogId: sourceSiteMigrationStatus?.target_blog_id,
				isAdminOnTarget: sourceSiteMigrationStatus?.is_target_blog_admin,
				isTargetBlogUpgraded: sourceSiteMigrationStatus?.is_target_blog_upgraded,
				targetBlogSlug: sourceSiteMigrationStatus?.target_blog_slug,
			};
		} catch ( error ) {
			return {
				isFromMigrationPlugin: true,
				hasError: true,
			};
		}
	}
	useEffect( () => {
		setIsMigrateFromWp( true );
		if ( submit ) {
			setPendingAction( fetchSourceMigrationStatus );
			submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getCurrentMessage = () => {
		return __( 'Scanning your site' );
	};

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="migration-handler"
				isHorizontalLayout={ true }
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<Title>{ getCurrentMessage() }</Title>
						<LoadingEllipsis />
					</>
				}
				stepProgress={ stepProgress }
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default MigrationHandler;
