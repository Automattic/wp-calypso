import { Button, Card, Gridicon, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
import withMediaStorage from 'calypso/data/media-storage/with-media-storage';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import { urlToSlug } from 'calypso/lib/url';
import { useAddStagingSiteMutation } from 'calypso/my-sites/hosting/staging-site-card/use-add-staging-site';
import { useCheckStagingSiteStatus } from 'calypso/my-sites/hosting/staging-site-card/use-check-staging-site-status';
import { useStagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';

const stagingSiteAddFailureNoticeId = 'staging-site-add-failure';

const FirstPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '85%',
	marginBottom: '0.25em',
} );
const SecondPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '60%',
	marginBottom: '1.5em',
} );
const ButtonPlaceholder = styled( LoadingPlaceholder )( {
	width: '148px',
	height: '40px',
} );

const StyledLoadingBar = styled( LoadingBar )( {
	marginBottom: '1em',
} );

const ExceedQuotaErrorWrapper = styled.div( {
	marginTop: '1em',
} );

export const StagingSiteCard = ( {
	currentUserId,
	disabled,
	spaceQuotaExceededForStaging,
	siteId,
	siteOwnerId,
	translate,
} ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ loadingError, setLoadingError ] = useState( false );

	const { data: stagingSites, isLoading: isLoadingStagingSites } = useStagingSite( siteId, {
		enabled: ! disabled,
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_load_failure', {
					code: error.code,
				} )
			);
			setLoadingError( error );
		},
	} );

	const stagingSite = useMemo( () => {
		return stagingSites && stagingSites.length ? stagingSites[ 0 ] : [];
	}, [ stagingSites ] );

	const showAddStagingSite = ! isLoadingStagingSites && stagingSites?.length === 0;
	const showManageStagingSite = ! isLoadingStagingSites && stagingSites?.length > 0;

	const [ wasCreating, setWasCreating ] = useState( false );
	const [ progress, setProgress ] = useState( 0.1 );
	const transferStatus = useCheckStagingSiteStatus( stagingSite.id );
	const isStagingSiteTransferComplete = transferStatus === transferStates.COMPLETE;
	const isTrasferInProgress =
		showManageStagingSite &&
		! isStagingSiteTransferComplete &&
		( transferStatus !== null || wasCreating );

	useEffect( () => {
		if ( wasCreating && isStagingSiteTransferComplete ) {
			queryClient.invalidateQueries( [ USE_SITE_EXCERPTS_QUERY_KEY ] );
			dispatch( successNotice( __( 'Staging site added.' ) ) );
		}
	}, [ dispatch, queryClient, __, isStagingSiteTransferComplete, wasCreating ] );

	useEffect( () => {
		setProgress( ( prevProgress ) => {
			switch ( transferStatus ) {
				case null:
					return 0.1;
				case 'relocating_revert':
				case 'active':
					return 0.2;
				case 'provisioned':
					return 0.6;
				case 'reverted':
				case 'relocating_switcheroo':
					return 0.85;
				case 'complete':
					return 0.98;
				default:
					return prevProgress + 0.05;
			}
		} );
	}, [ transferStatus ] );

	const { addStagingSite, isLoading: addingStagingSite } = useAddStagingSiteMutation( siteId, {
		onMutate: () => {
			dispatch( removeNotice( stagingSiteAddFailureNoticeId ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the staging site failed.
					sprintf( __( 'Failed to add staging site: %(reason)s' ), { reason: error.message } ),
					{
						id: stagingSiteAddFailureNoticeId,
					}
				)
			);
		},
	} );

	const getExceedQuotaErrorContent = () => {
		return (
			<ExceedQuotaErrorWrapper data-testid="quota-message">
				<Notice status="is-warning" showDismiss={ false }>
					{ __(
						'Your available storage space is lower than 50%, which is insufficient for creating a staging site.'
					) }
				</Notice>
			</ExceedQuotaErrorWrapper>
		);
	};

	const getNewStagingSiteContent = () => {
		return (
			<>
				<p>
					{ translate(
						'A staging site is a test version of your website you can use to preview and troubleshoot changes before applying them to your production site.'
					) }
				</p>
				<Button
					primary
					disabled={ disabled || addingStagingSite || spaceQuotaExceededForStaging }
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' ) );
						setWasCreating( true );
						setProgress( 0.1 );
						addStagingSite();
					} }
				>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ spaceQuotaExceededForStaging && getExceedQuotaErrorContent() }
			</>
		);
	};

	const getManageStagingSiteContent = () => {
		return (
			<>
				<p>
					{ translate( 'Your staging site is available at {{a}}%(stagingSiteName)s{{/a}}.', {
						args: {
							stagingSiteName: stagingSite.url,
						},
						components: {
							a: <a href={ stagingSite.url } />,
						},
					} ) }
				</p>
				<Button primary href={ `/home/${ urlToSlug( stagingSite.url ) }` } disabled={ disabled }>
					<span>{ translate( 'Manage staging site' ) }</span>
				</Button>
			</>
		);
	};

	const getTransferringStagingSiteContent = useCallback( () => {
		const message =
			siteOwnerId === currentUserId
				? __( 'We are setting up your staging site. We’ll email you once it is ready.' )
				: __( 'We are setting up the staging site. We’ll email the site owner once it is ready.' );
		return (
			<div data-testid="transferring-staging-content">
				<StyledLoadingBar progress={ progress } />
				<p>{ message }</p>
			</div>
		);
	}, [ progress, __, siteOwnerId, currentUserId ] );

	const getLoadingStagingSitesPlaceholder = () => {
		return (
			<div data-testid="loading-placeholder">
				<FirstPlaceholder />
				<SecondPlaceholder />
				<ButtonPlaceholder />
			</div>
		);
	};

	const getLoadingErrorContent = () => {
		return (
			<Notice status="is-error" showDismiss={ false }>
				{ __(
					'Unable to load staging sites. Please contact support if you believe you are seeing this message in error.'
				) }
			</Notice>
		);
	};

	let stagingSiteCardContent;
	if ( ! isLoadingStagingSites && loadingError ) {
		stagingSiteCardContent = getLoadingErrorContent();
	} else if ( addingStagingSite || isTrasferInProgress ) {
		stagingSiteCardContent = getTransferringStagingSiteContent();
	} else if ( showManageStagingSite && isStagingSiteTransferComplete ) {
		stagingSiteCardContent = getManageStagingSiteContent();
	} else if ( showAddStagingSite && ! addingStagingSite ) {
		stagingSiteCardContent = getNewStagingSiteContent();
	} else {
		stagingSiteCardContent = getLoadingStagingSitesPlaceholder();
	}

	return (
		<Card className="staging-site-card">
			{
				// eslint-disable-next-line wpcalypso/jsx-gridicon-size
				<Gridicon icon="science" size={ 32 } />
			}
			<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
			{ stagingSiteCardContent }
		</Card>
	);
};

export default withMediaStorage(
	connect( ( state, { mediaStorage } ) => {
		const currentUserId = getCurrentUserId( state );
		const siteId = getSelectedSiteId( state );
		const siteOwnerId = getSelectedSite( state )?.site_owner;

		let spaceQuotaExceededForStaging = false;
		// We check against -1 as this is the default value for sites with
		// upload_space_check_disabled option.
		if ( mediaStorage.storage_used_bytes > -1 && mediaStorage?.max_storage_bytes > -1 ) {
			spaceQuotaExceededForStaging =
				mediaStorage.storage_used_bytes > mediaStorage.max_storage_bytes / 2;
		}
		return {
			currentUserId,
			siteId,
			spaceQuotaExceededForStaging,
			siteOwnerId,
		};
	} )( localize( StagingSiteCard ) )
);
