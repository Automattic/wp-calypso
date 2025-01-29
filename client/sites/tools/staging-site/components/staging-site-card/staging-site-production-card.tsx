import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { urlToSlug } from 'calypso/lib/url';
import { showSitesPage } from 'calypso/sites/components/sites-dashboard';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import { getIsSyncingInProgress } from 'calypso/state/sync/selectors/get-is-syncing-in-progress';
import { IAppState } from 'calypso/state/types';
import { useProductionSiteDetail, ProductionSite } from '../../hooks/use-production-site-detail';
import { usePullFromStagingMutation, usePushToStagingMutation } from '../../hooks/use-staging-sync';
import { CardContentWrapper } from './card-content/card-content-wrapper';
import { SiteSyncCard } from './card-content/staging-sync-card';
import { LoadingPlaceholder } from './loading-placeholder';

const ActionButtons = styled.div( {
	display: 'flex',
	'@media ( max-width: 768px )': {
		flexDirection: 'column',
		alignItems: 'stretch',
	},
} );

const SyncActionsContainer = styled( ActionButtons )( {
	marginTop: 24,
} );

type CardProps = {
	disabled?: boolean;
	siteId: number;
	translate: ( text: string, args?: Record< string, unknown > ) => string;
};

function StagingSiteProductionCard( { disabled, siteId, translate }: CardProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ syncError, setSyncError ] = useState< string | null >( null );
	const stagingSiteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const {
		data: productionSite,
		isLoading,
		error: loadingError,
	} = useProductionSiteDetail( siteId, {
		enabled: ! disabled,
	} );

	useEffect( () => {
		if ( loadingError ) {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_load_failure', {
					code: loadingError.code,
				} )
			);
		}
	}, [ dispatch, loadingError ] );

	const isSyncInProgress = useSelector( ( state ) =>
		getIsSyncingInProgress( state, productionSite?.id as number )
	);

	const { pushToStaging } = usePushToStagingMutation( productionSite?.id as number, siteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success' ) );
			setSyncError( null );
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.code );
		},
	} );

	const { pullFromStaging } = usePullFromStagingMutation( productionSite?.id as number, siteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success' ) );
			setSyncError( null );
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.code );
		},
	} );

	const getLoadingErrorContent = ( message: string ) => {
		return (
			<Notice status="is-error" showDismiss={ false }>
				{ message }
			</Notice>
		);
	};

	const getManageStagingSiteContent = ( productionSite: ProductionSite ) => {
		return (
			<>
				<ActionButtons>
					<Button
						primary
						onClick={ () => showSitesPage( `/overview/${ urlToSlug( productionSite.url ) }` ) }
						disabled={ disabled || isSyncInProgress }
					>
						<span>{ __( 'Switch to production site' ) }</span>
					</Button>
				</ActionButtons>
				<SyncActionsContainer>
					<SiteSyncCard
						type="staging"
						productionSiteId={ productionSite.id }
						siteUrls={ {
							production: productionSite.url,
							staging: stagingSiteUrl,
						} }
						onPush={ pullFromStaging }
						onPull={ pushToStaging }
						error={ syncError }
						disabled={ disabled || isSyncInProgress }
					/>
				</SyncActionsContainer>
			</>
		);
	};

	let cardContent;
	if ( ! isLoading && productionSite ) {
		cardContent = getManageStagingSiteContent( productionSite );
	} else if ( isLoading ) {
		cardContent = <LoadingPlaceholder />;
	} else if ( loadingError ) {
		cardContent = getLoadingErrorContent(
			__(
				'Unable to load production site detail. Please contact support if you believe you are seeing this message in error.'
			)
		);
	}

	return (
		<CardContentWrapper
			subtitle={ translate(
				'This staging site lets you preview and troubleshoot changes before updating the production site. {{a}}Learn more{{/a}}',
				{
					components: {
						a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
					},
				}
			) }
		>
			{ cardContent }
		</CardContentWrapper>
	);
}

export default connect( ( state: IAppState ) => {
	const currentUserId = getCurrentUserId( state );

	return {
		currentUserId,
	};
} )( localize( StagingSiteProductionCard ) );
