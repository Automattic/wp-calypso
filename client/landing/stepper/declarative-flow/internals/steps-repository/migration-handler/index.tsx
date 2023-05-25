import { StepContainer, Title } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const { data: sourceSiteMigrationStatus, isError: isErrorSourceSiteMigrationStatus } =
		useSourceMigrationStatusQuery( sourceSiteSlug );
	const errorDependency = {
		isFromMigrationPlugin: true,
		hasError: true,
	};

	useEffect( () => {
		setIsMigrateFromWp( true );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		if ( submit ) {
			if ( isErrorSourceSiteMigrationStatus ) {
				return submit( errorDependency );
			}
			if ( sourceSiteMigrationStatus ) {
				submit( {
					isFromMigrationPlugin: true,
					status: sourceSiteMigrationStatus?.status,
					targetBlogId: sourceSiteMigrationStatus?.target_blog_id,
					isAdminOnTarget: sourceSiteMigrationStatus?.is_target_blog_admin,
					isTargetBlogUpgraded: sourceSiteMigrationStatus?.is_target_blog_upgraded,
					targetBlogSlug: sourceSiteMigrationStatus?.target_blog_slug,
				} );
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isErrorSourceSiteMigrationStatus, sourceSiteMigrationStatus ] );

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
