import { Card, Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestDisconnectSiteStripeAccount } from 'calypso/state/memberships/settings/actions';
import {
	getConnectedAccountIdForSiteId,
	getConnectedAccountDescriptionForSiteId,
	getConnectUrlForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

function Settings() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ disconnectedConnectedAccountId, setDisconnectedConnectedAccountId ] = useState( null );

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);

	const connectedAccountDescription = useSelector( ( state ) =>
		getConnectedAccountDescriptionForSiteId( state, site?.ID )
	);
	const connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	function onCloseDisconnectStripeAccount( reason: string | undefined ) {
		if ( reason === 'disconnect' ) {
			dispatch(
				requestDisconnectSiteStripeAccount(
					site?.ID,
					connectedAccountId,
					translate( 'Please wait, disconnecting Stripe\u2026' ),
					translate( 'Stripe account is disconnected.' )
				)
			);
		}
		setDisconnectedConnectedAccountId( null );
	}

	function renderHeader() {
		return (
			<SectionHeader label={ translate( 'Settings' ) }>
				{ ! connectedAccountId && (
					<Button
						primary
						compact
						href={ connectUrl }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_memberships_stripe_connect_click' ) )
						}
					>
						{ translate( 'Connect Stripe' ) }
					</Button>
				) }
			</SectionHeader>
		);
	}

	function renderContent() {
		return connectedAccountId ? (
			<Card
				onClick={ () => setDisconnectedConnectedAccountId( connectedAccountId ) }
				className="memberships__settings-link"
			>
				<div className="memberships__module-plans-content">
					<div className="memberships__module-plans-icon">
						<Gridicon size={ 24 } icon="link-break" />
					</div>
					<div>
						<div className="memberships__module-settings-title">
							{ translate( 'Disconnect Stripe Account' ) }
						</div>
						{ connectedAccountDescription ? (
							<div className="memberships__module-settings-description">
								{ translate( 'Connected to %(connectedAccountDescription)s', {
									args: {
										connectedAccountDescription: connectedAccountDescription,
									},
								} ) }
							</div>
						) : null }
					</div>
				</div>
			</Card>
		) : (
			<Card className="memberships__settings-link">
				<div className="memberships__module-plans-content">
					<div>
						<div className="memberships__module-plans-title">
							{ translate( 'Connect a Stripe account to start collecting payments.' ) }
						</div>
						{ connectedAccountDescription ? (
							<div className="memberships__module-plans-title">
								{ translate(
									'Previously connected to Stripe account %(connectedAccountDescription)s',
									{
										args: {
											connectedAccountDescription: connectedAccountDescription,
										},
									}
								) }
							</div>
						) : null }
					</div>
				</div>
			</Card>
		);
	}

	function renderDialog() {
		return (
			<Dialog
				isVisible={ !! disconnectedConnectedAccountId }
				buttons={ [
					{
						label: translate( 'Cancel' ),
						action: 'cancel',
					},
					{
						label: translate( 'Disconnect Payments from Stripe' ),
						isPrimary: true,
						action: 'disconnect',
					},
				] }
				onClose={ onCloseDisconnectStripeAccount }
			>
				<h1>{ translate( 'Confirmation' ) }</h1>
				<p>{ translate( 'Do you want to disconnect Payments from your Stripe account?' ) }</p>
				<Notice
					text={ translate(
						'Once you disconnect Payments from Stripe, new subscribers won’t be able to sign up and existing subscriptions will stop working.'
					) }
					showDismiss={ false }
				/>
			</Dialog>
		);
	}

	return (
		<div>
			{ renderHeader() }
			{ renderContent() }
			{ renderDialog() }
		</div>
	);
}

export default Settings;
