import { Button, Card, Gridicon, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { LoadingBar } from 'calypso/components/loading-bar';
import { urlToSlug } from 'calypso/lib/url';
import { useAddStagingSiteMutation } from 'calypso/my-sites/hosting/staging-site-card/use-add-staging-site';
import { useCheckStagingSiteStatus } from 'calypso/my-sites/hosting/staging-site-card/use-check-staging-site-status';
import { useStagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

const StagingSiteCard = ( { disabled, siteId, translate } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { data: stagingSites, isLoading: isLoadingStagingSites } = useStagingSite( siteId, {
		enabled: ! disabled,
	} );

	const stagingSite = stagingSites?.length ? stagingSites[ 0 ] : {};

	const showAddStagingSite = ! isLoadingStagingSites && stagingSites?.length === 0;
	const showManageStagingSite = ! isLoadingStagingSites && stagingSites?.length > 0;

	const [ wasCreating, setWasCreating ] = useState( false );
	const [ progress, setProgress ] = useState( 0.3 );
	const transferStatus = useCheckStagingSiteStatus( stagingSite.id );
	const isStagingSiteTransferComplete = transferStatus === transferStates.COMPLETE;
	const isTrasferInProgress =
		showManageStagingSite &&
		! isStagingSiteTransferComplete &&
		( transferStatus !== null || wasCreating );

	useEffect( () => {
		if ( wasCreating && isStagingSiteTransferComplete ) {
			dispatch( successNotice( __( 'Staging site added.' ) ) );
		}
	}, [ dispatch, __, isStagingSiteTransferComplete, wasCreating ] );

	useEffect( () => {
		setProgress( ( prevProgress ) => prevProgress + 0.25 );
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
					disabled={ disabled || addingStagingSite }
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' ) );
						setWasCreating( true );
						setProgress( 0.1 );
						addStagingSite();
					} }
				>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
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
		return (
			<>
				<StyledLoadingBar progress={ progress } />
				<p>{ __( 'We are setting up your staging site. We’ll email you once it is ready.' ) }</p>
			</>
		);
	}, [ progress, __ ] );

	const getLoadingStagingSitesPlaceholder = () => {
		return (
			<>
				<FirstPlaceholder />
				<SecondPlaceholder />
				<ButtonPlaceholder />
			</>
		);
	};

	let stagingSiteCardContent;
	if ( addingStagingSite || isTrasferInProgress ) {
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
				<Gridicon icon="share-computer" size={ 32 } />
			}
			<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
			{ stagingSiteCardContent }
		</Card>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( localize( StagingSiteCard ) );
