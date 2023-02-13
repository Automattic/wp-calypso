import { StepContainer, Title } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSite, getSourceSiteMigrationData } from '../import/helper';
import type { Step } from '../../types';
import './styles.scss';

const MigrationHandler: Step = function MigrationHandler( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );
	const { setPendingAction, setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );

	async function fetchSourceMigrationStatus() {
		const search = window.location.search;
		const sourceSiteSlug = new URLSearchParams( search ).get( 'from' ) || '';
		try {
			const sourceSiteInfo = await getSite( sourceSiteSlug );
			const sourceSiteMigrationStatus = await getSourceSiteMigrationData( sourceSiteInfo?.ID );

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
