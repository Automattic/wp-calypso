/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import {
	emailManagementManageTitanAccount,
	emailManagementNewTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import FoldableCard from 'calypso/components/foldable-card';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import { isEnabled } from '@automattic/calypso-config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import titanCalendarIcon from 'calypso/assets/images/email-providers/titan/services/calendar.svg';
import titanContactsIcon from 'calypso/assets/images/email-providers/titan/services/contacts.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/mail.svg';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import {
	getConfiguredTitanMailboxCount,
	getMaxTitanMailboxCount,
	getTitanProductName,
} from 'calypso/lib/titan';
import { TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL } from 'calypso/lib/titan/constants';

/**
 * Style
 */
import './style.scss';

class TitanManagementNav extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,

		// Props injected via connect()
		currentRoute: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,

		// Props injected via localize()
		translate: PropTypes.func.isRequired,
	};

	renderTitanManagementLink = () => {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const linkTitle = translate( 'Manage your email settings and accounts' );
		const controlPanelClickHandler = this.getNavItemClickHandler( 'control_panel' );

		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			return (
				<VerticalNavItem
					path={ emailManagementManageTitanAccount( selectedSiteSlug, domain.name, currentRoute ) }
					onClick={ controlPanelClickHandler }
				>
					{ linkTitle }
				</VerticalNavItem>
			);
		}

		return (
			<VerticalNavItem
				path={ emailManagementTitanControlPanelRedirect(
					selectedSiteSlug,
					domain.name,
					currentRoute
				) }
				external={ true }
				onClick={ controlPanelClickHandler }
			>
				{ linkTitle }
			</VerticalNavItem>
		);
	};

	renderPurchaseManagementLink = () => {
		const { domain, selectedSiteSlug, translate } = this.props;

		if ( ! domain?.titanMailSubscription?.subscriptionId ) {
			return null;
		}

		return (
			<VerticalNavItem
				path={ getManagePurchaseUrlFor(
					selectedSiteSlug,
					domain.titanMailSubscription.subscriptionId
				) }
				onClick={ this.getNavItemClickHandler( 'manage_purchase' ) }
			>
				{ translate( 'Update your billing and payment settings' ) }
			</VerticalNavItem>
		);
	};

	renderMailboxSetupPrompt = () => {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const numberOfUnusedMailboxes =
			getMaxTitanMailboxCount( domain ) - getConfiguredTitanMailboxCount( domain );

		if ( numberOfUnusedMailboxes <= 0 ) {
			return;
		}

		const showExternalControlPanelLink = ! isEnabled( 'titan/iframe-control-panel' );
		const controlPanelUrl = showExternalControlPanelLink
			? emailManagementTitanControlPanelRedirect( selectedSiteSlug, domain.name, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			  } )
			: emailManagementManageTitanAccount( selectedSiteSlug, domain.name, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			  } );

		return (
			<CompactCard className="titan-management-nav__mailbox-setup-prompt" highlight="info">
				<span>
					<Gridicon icon="info-outline" size={ 18 } />
					<em>
						{ translate(
							'You have %(numberOfMailboxes)d unused mailbox',
							'You have %(numberOfMailboxes)d unused mailboxes',
							{
								count: numberOfUnusedMailboxes,
								args: {
									numberOfMailboxes: numberOfUnusedMailboxes,
								},
								comment:
									'This refers to the number of mailboxes purchased that have not been set up yet',
							}
						) }
					</em>
				</span>

				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Button
					compact
					href={ controlPanelUrl }
					target={ showExternalControlPanelLink ? '_blank' : null }
					onClick={ () => {
						recordTracksEvent( 'calypso_email_management_titan_nav_finish_setup_click', {
							domain: domain.name,
						} );
					} }
				>
					{ translate( 'Finish Setup' ) }
					{ showExternalControlPanelLink && <Gridicon icon="external" size={ 16 } /> }
				</Button>
				{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
			</CompactCard>
		);
	};

	getNavItemClickHandler = ( clickedItem ) => () => {
		const { domain } = this.props;

		recordTracksEvent( 'calypso_email_management_titan_nav_item_click', {
			clicked_item: clickedItem,
			domain: domain.name,
		} );
	};

	render() {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const header = (
			<>
				<Gridicon
					className="titan-management-nav__foldable-card-header-icon"
					icon="my-sites"
					size={ 36 }
				/>

				<span className="titan-management-nav__foldable-card-header-text">
					<strong>{ getTitanProductName() }</strong>
					<em>{ domain.name }</em>
				</span>
			</>
		);

		const summary = domain?.titanMailSubscription?.subscriptionId && (
			<Button
				primary
				compact
				href={ emailManagementNewTitanAccount( selectedSiteSlug, domain.name, currentRoute ) }
				onClick={ () => {
					recordTracksEvent( 'calypso_email_management_titan_nav_add_mailbox_click', {
						domain: domain.name,
					} );
				} }
			>
				{ translate( 'Add New Mailboxes' ) }
			</Button>
		);

		return (
			<div className="titan-management-nav">
				<FoldableCard
					className="titan-management-nav__foldable-card"
					header={ header }
					summary={ summary }
					expandedSummary={ summary }
					onOpen={ this.getNavItemClickHandler( 'quick_links_show' ) }
				>
					<ul className="titan-management-nav__foldable-card-services">
						<li>
							<a
								href="https://wp.titan.email/mail/"
								target="_blank"
								rel="noreferrer noopener"
								onClick={ this.getNavItemClickHandler( 'webmail' ) }
							>
								<img src={ titanMailIcon } alt={ translate( 'Titan Mail icon' ) } />
								<strong>
									{ translate( 'Mail', {
										comment: 'This refers to the Email application (i.e. the webmail) of Titan',
									} ) }
								</strong>
							</a>
						</li>
						<li>
							<a
								href="https://wp.titan.email/calendar/"
								target="_blank"
								rel="noreferrer noopener"
								onClick={ this.getNavItemClickHandler( 'calendar' ) }
							>
								<img src={ titanCalendarIcon } alt={ translate( 'Titan Calendar icon' ) } />
								<strong>
									{ translate( 'Calendar', {
										comment: 'This refers to the Calendar application of Titan',
									} ) }
								</strong>
							</a>
						</li>
						<li>
							<a
								href="https://wp.titan.email/contacts/"
								target="_blank"
								rel="noreferrer noopener"
								onClick={ this.getNavItemClickHandler( 'contacts' ) }
							>
								<img src={ titanContactsIcon } alt={ translate( 'Titan Contacts icon' ) } />
								<strong>
									{ translate( 'Contacts', {
										comment: 'This refers to the Contacts application of Titan',
									} ) }
								</strong>
							</a>
						</li>
					</ul>
				</FoldableCard>

				<VerticalNav>
					{ this.renderMailboxSetupPrompt() }
					{ this.renderTitanManagementLink() }
					{ this.renderPurchaseManagementLink() }
				</VerticalNav>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			currentRoute: getCurrentRoute( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( TitanManagementNav ) );
