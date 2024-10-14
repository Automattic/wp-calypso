import { Dialog } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { Notice } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useEffect } from 'react';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { navigate } from 'calypso/lib/navigate';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { useDispatch } from 'calypso/state';
import { requestDisconnectSiteStripeAccount } from 'calypso/state/memberships/settings/actions';
import StartImportButton from './../start-import-button';
import type { SiteDetails } from '@automattic/data-stores';

type NoPlansProps = {
	cardData: SubscribersStepContent;
	selectedSite: SiteDetails;
	engine: string;
	siteSlug: string;
	fromSite: string;
};

export default function NoPlans( {
	cardData,
	selectedSite,
	engine,
	siteSlug,
	fromSite,
}: NoPlansProps ) {
	const { __ } = useI18n();
	const currentStep = 'subscribers';
	const [ showDisconnectStripeDialog, setShowDisconnectStripeDialog ] = useState( false );
	const [ shouldCheckConnection, setShouldCheckConnection ] = useState( false );

	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	const disconnectStripe = () => {
		setShowDisconnectStripeDialog( true );
		setShouldCheckConnection( false );
	};

	useEffect( () => {
		if ( shouldCheckConnection ) {
			// Invalidete the state so that we fetch it again.
			queryClient.invalidateQueries( {
				queryKey: [ 'paid-newsletter-importer', selectedSite.ID, engine ],
			} );
		}
	}, [ engine, queryClient, selectedSite.ID, shouldCheckConnection ] );

	function onCloseDisconnectStripeAccount( reason: string | undefined ) {
		if ( reason === 'disconnect' ) {
			dispatch(
				requestDisconnectSiteStripeAccount(
					selectedSite.ID,
					__( 'Please wait, disconnecting Stripe…' ),
					__( 'Stripe account is disconnected.' )
				)
			);
			setTimeout( () => {
				setShouldCheckConnection( true );
			}, 1000 );
		}
		setShowDisconnectStripeDialog( false );
	}

	return (
		<>
			<Notice isDismissible={ false } status="warning">
				{ __( "We couldn't find any plans in your connected Stripe account." ) }
			</Notice>
			<div className="no-plans__info">
				<p>
					{ sprintf(
						// translators: %d is the Stripe account name
						__(
							'It looks like the Stripe Account (%s) does not have any active plans. Are you sure you connected the same Stripe account that you use on Substack?'
						),
						cardData?.account_display
					) }
				</p>
			</div>
			<ImporterActionButtonContainer>
				<ImporterActionButton onClick={ disconnectStripe } primary>
					{ __( 'Try a different Stripe account' ) }
				</ImporterActionButton>

				<StartImportButton
					engine={ engine }
					siteId={ selectedSite.ID }
					primary={ false }
					step={ currentStep }
					label={ __( 'Only import free subscribers' ) }
					navigate={ () => {
						navigate( `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` );
					} }
				/>
			</ImporterActionButtonContainer>
			<Dialog
				className="memberships__stripe-disconnect-modal"
				isVisible={ showDisconnectStripeDialog }
				buttons={ [
					{
						label: __( 'Cancel' ),
						action: 'cancel',
					},
					{
						label: __( 'Disconnect Payments from Stripe' ),
						isPrimary: true,
						additionalClassNames: 'is-scary',
						action: 'disconnect',
					},
				] }
				onClose={ onCloseDisconnectStripeAccount }
			>
				<h1>{ __( 'Disconnect Stripe?' ) }</h1>
				<p>
					{ __(
						'Once you disconnect Payments from Stripe, new subscribers won’t be able to sign up and existing subscriptions will stop working.'
					) }
				</p>
			</Dialog>
		</>
	);
}
