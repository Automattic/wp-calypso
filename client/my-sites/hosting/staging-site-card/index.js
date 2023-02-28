import { Button, Card, Spinner } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import { useAddStagingSiteMutation } from 'calypso/my-sites/hosting/staging-site-card/use-add-staging-site';
import { useCheckStagingSiteStatus } from 'calypso/my-sites/hosting/staging-site-card/use-check-staging-site-status';
import { useStagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const stagingSiteAddFailureNoticeId = 'staging-site-add-failure';

const StagingSiteCard = ( { disabled, siteId, translate } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { data: stagingSites, isLoading: isLoadingStagingSites } = useStagingSite( siteId, {
		enabled: ! disabled,
	} );

	const stagingSite = stagingSites && stagingSites.length ? stagingSites[ 0 ] : [];
	const stagingSiteSlug = useSelector( ( state ) => getSiteSlug( state, stagingSite.id ) );

	const showAddStagingSite = ! isLoadingStagingSites && stagingSites && stagingSites.length === 0;
	const showManageStagingSite = ! isLoadingStagingSites && stagingSites && stagingSites.length > 0;

	const transferStatus = useCheckStagingSiteStatus( stagingSite.id );
	const isStagingSiteTransferComplete = transferStatus === transferStates.COMPLETE;

	useEffect( () => {
		if ( isStagingSiteTransferComplete ) {
			dispatch( successNotice( __( 'Staging site added.' ) ) );
		}
	}, [ dispatch, __, isStagingSiteTransferComplete ] );

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
			<div>
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
						addStagingSite();
					} }
				>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
			</div>
		);
	};

	const getManageStagingSiteContent = () => {
		return (
			<div>
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
				<Button primary href={ `/home/${ stagingSiteSlug }` } disabled={ disabled }>
					<span>{ translate( 'Manage staging site' ) }</span>
				</Button>
			</div>
		);
	};

	return (
		<Card className="staging-site-card">
			<MaterialIcon icon="share" size={ 24 } />
			<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
			{ showAddStagingSite && ! addingStagingSite && getNewStagingSiteContent() }
			{ showManageStagingSite && isStagingSiteTransferComplete && getManageStagingSiteContent() }
			{ ( isLoadingStagingSites ||
				addingStagingSite ||
				( showManageStagingSite && ! isStagingSiteTransferComplete ) ) && <Spinner /> }
		</Card>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( localize( StagingSiteCard ) );
