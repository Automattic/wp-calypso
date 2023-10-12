import { isEnabled } from '@automattic/calypso-config';
import { Button, Card, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import dividerPattern from 'calypso/assets/images/hosting/divider-pattern.svg';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { navigate } from 'calypso/lib/navigate';
import { urlToSlug } from 'calypso/lib/url';
import { LoadingPlaceholder } from 'calypso/my-sites/hosting/staging-site-card/loading-placeholder';
import {
	useProductionSiteDetail,
	ProductionSite,
} from 'calypso/my-sites/hosting/staging-site-card/use-production-site-detail';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getIsSyncingInProgress } from 'calypso/state/sync/selectors/get-is-syncing-in-progress';
import { IAppState } from 'calypso/state/types';
import { SiteSyncCard } from './card-content/staging-sync-card';
import { usePullFromStagingMutation, usePushToStagingMutation } from './use-staging-sync';

const ProductionCard = styled( Card )( {
	paddingTop: '0',
} );

const Divider = styled.div( {
	position: 'absolute',
	left: 0,
	right: 0,
	height: '16px',
	overflow: 'hidden',
	img: {
		position: 'absolute',
	},
	backgroundImage: `url(${ dividerPattern })`,
} );

const ProductionCardIcon = styled( Gridicon )( {
	marginTop: '36px',
} );

const ProductionCardHeading = styled( CardHeading )( {
	marginTop: '36px!important',
} );

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
} );

const SyncActionsContainer = styled( ActionButtons )( {
	marginTop: 24,
} );

type CardProps = {
	disabled: boolean;
	siteId: number;
	translate: ( text: string, args?: Record< string, unknown > ) => string;
};

function StagingSiteProductionCard( { disabled, siteId, translate }: CardProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ loadingError, setLoadingError ] = useState( null );
	const [ syncError, setSyncError ] = useState( null );
	const isStagingSitesI3Enabled = isEnabled( 'yolo/staging-sites-i3' );
	const { data: productionSite, isLoading } = useProductionSiteDetail( siteId, {
		enabled: ! disabled,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_load_failure', {
					code: error.code,
				} )
			);
			setLoadingError( error );
		},
	} );
	const isSyncInProgress = useSelector( ( state ) =>
		getIsSyncingInProgress( state, productionSite?.id as number )
	);

	const { pushToStaging } = usePushToStagingMutation( productionSite?.id as number, siteId, {
		onSuccess: () => {
			setSyncError( null );
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.message );
		},
	} );

	const { pullFromStaging } = usePullFromStagingMutation( productionSite?.id as number, siteId, {
		onSuccess: () => {
			setSyncError( null );
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onError: ( error: any ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.message );
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
				<p>
					{ translate(
						'This staging site lets you preview and troubleshoot changes before updating the production site. {{a}}Learn more{{/a}}.',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
							},
						}
					) }
				</p>
				<ActionButtons>
					<Button
						primary
						onClick={ () => navigate( `/hosting-config/${ urlToSlug( productionSite.url ) }` ) }
						disabled={ disabled || isSyncInProgress }
					>
						<span>{ __( 'Switch to production site' ) }</span>
					</Button>
				</ActionButtons>
				{ isStagingSitesI3Enabled && (
					<SyncActionsContainer>
						<SiteSyncCard
							type="staging"
							productionSiteId={ productionSite.id }
							onPush={ pullFromStaging }
							onPull={ pushToStaging }
							error={ syncError }
							disabled={ disabled || isSyncInProgress }
						/>
					</SyncActionsContainer>
				) }
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
		<ProductionCard className="staging-site-card">
			<Divider />
			{
				// eslint-disable-next-line wpcalypso/jsx-gridicon-size
				<ProductionCardIcon icon="science" size={ 32 } />
			}
			<ProductionCardHeading id="staging-site">{ __( 'Staging site' ) }</ProductionCardHeading>
			{ cardContent }
		</ProductionCard>
	);
}

export default connect( ( state: IAppState ) => {
	const currentUserId = getCurrentUserId( state );

	return {
		currentUserId,
	};
} )( localize( StagingSiteProductionCard ) );
