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
import { Button } from '@automattic/components';
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
import titanCalendarIcon from 'calypso/assets/images/email-providers/titan/services/calendar.svg';
import titanContactsIcon from 'calypso/assets/images/email-providers/titan/services/contacts.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/mail.svg';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getTitanProductName } from 'calypso/lib/titan/get-titan-product-name';

/**
 * Style
 */
import './style.scss';

class TitanManagementNav extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
	};

	renderTitanManagementLink = () => {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const linkTitle = translate( 'Manage your email settings and accounts' );

		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			return (
				<VerticalNavItem
					path={ emailManagementManageTitanAccount( selectedSiteSlug, domain.name, currentRoute ) }
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
			>
				{ translate( 'Update your billing and payment settings' ) }
			</VerticalNavItem>
		);
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
				>
					<ul className="titan-management-nav__foldable-card-services">
						<li>
							<a href="https://wp.titan.email/mail/" target="_blank" rel="noreferrer noopener">
								<img src={ titanMailIcon } alt={ translate( 'Titan Mail icon' ) } />
								<strong>
									{ translate( 'Mail', {
										comments: 'This refers to the Email application (i.e. the webmail) of Titan',
									} ) }
								</strong>
							</a>
						</li>
						<li>
							<a href="https://wp.titan.email/calendar/" target="_blank" rel="noreferrer noopener">
								<img src={ titanCalendarIcon } alt={ translate( 'Titan Calendar icon' ) } />
								<strong>
									{ translate( 'Calendar', {
										comments: 'This refers to the Calendar application of Titan',
									} ) }
								</strong>
							</a>
						</li>
						<li>
							<a href="https://wp.titan.email/contacts/" target="_blank" rel="noreferrer noopener">
								<img src={ titanContactsIcon } alt={ translate( 'Titan Contacts icon' ) } />
								<strong>
									{ translate( 'Contacts', {
										comments: 'This refers to the Contacts application of Titan',
									} ) }
								</strong>
							</a>
						</li>
					</ul>
				</FoldableCard>

				<VerticalNav>
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
