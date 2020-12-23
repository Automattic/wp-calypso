/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { addItems } from 'calypso/lib/cart/actions';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Notice from 'calypso/components/notice';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasTitanMailWithUs, getMaxTitanMailboxCount } from 'calypso/lib/titan';

/**
 * Style dependencies
 */
import './style.scss';

class TitanMailQuantitySelection extends React.Component {
	state = {
		quantity: 1,
	};

	recordClickEvent = ( eventName ) => {
		const { recordTracksEvent, selectedDomainName } = this.props;
		recordTracksEvent( eventName, {
			domain_name: selectedDomainName,
			quantity: this.state.quantity,
		} );
	};

	goToEmail = () => {
		page(
			emailManagement(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};

	handleCancel = () => {
		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_cancel_button_click'
		);
		this.goToEmail();
	};

	getCartItem = () => {
		const { selectedDomain } = this.props;
		let quantity = this.state.quantity;

		if ( hasTitanMailWithUs( selectedDomain ) ) {
			quantity += getMaxTitanMailboxCount( selectedDomain );
		}

		return titanMailMonthly( { domain: selectedDomain.name, quantity } );
	};

	handleContinue = () => {
		const { selectedSite } = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_continue_button_click'
		);

		addItems( [ this.getCartItem() ] );
		page( '/checkout/' + selectedSite.slug );
	};

	onQuantityChange = ( e ) => {
		const parsedQuantity = parseInt( e.target.value, 10 );
		const quantity = isNaN( parsedQuantity ) ? 1 : Math.max( 1, parsedQuantity );

		if ( quantity.toString() !== e.target.value ) {
			e.target.value = quantity;
		}

		this.setState( { quantity } );
	};

	renderForwardsNotice() {
		const { domainsWithForwards, translate } = this.props;
		return domainsWithForwards.length ? (
			<Notice showDismiss={ false } status="is-warning">
				{ translate(
					'Please note that email forwards are not compatible with %(productName)s, ' +
						'and will be disabled once %(productName)s is added to this domain. The following ' +
						'domains have forwards:',
					{
						args: {
							productName: translate( 'Titan Mail' ),
						},
						comment: '%(productName)s is the name of the product, e.g. Titan Mail',
					}
				) }
				<ul>
					{ domainsWithForwards.map( ( domainName ) => {
						return <li key={ domainName }>{ domainName }</li>;
					} ) }
				</ul>
			</Notice>
		) : null;
	}

	renderForm() {
		const { isLoadingDomains, translate } = this.props;

		if ( isLoadingDomains ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Choose Quantity' ) } />

				<Card>
					<div>
						<FormLabel>{ translate( 'Number of new users to add' ) }</FormLabel>
						<FormTextInput
							name="quantity"
							type="number"
							min="1"
							placeholder={ translate( 'Number of new users' ) }
							value={ this.state.quantity }
							onChange={ this.onQuantityChange }
						/>
					</div>

					<hr className="titan-mail-quantity-selection__divider" />

					<div className="titan-mail-quantity-selection__buttons">
						<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>
						<Button primary onClick={ this.handleContinue }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</Card>
			</>
		);
	}

	render() {
		const { selectedDomainName, selectedSite, translate } = this.props;
		return (
			<>
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<Main>
					<DomainManagementHeader
						onClick={ this.goToEmail }
						selectedDomainName={ selectedDomainName }
					>
						{ translate( 'Titan Mail' ) }
					</DomainManagementHeader>

					{ this.renderForwardsNotice() }
					{ this.renderForm() }
				</Main>
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		const siteId = selectedSite?.ID ?? null;
		const domains = getDomainsBySiteId( state, siteId );
		const isLoadingDomains =
			! hasLoadedSiteDomains( state, siteId ) || isRequestingSiteDomains( state, siteId );
		return {
			selectedSite,
			isLoadingDomains,
			selectedDomain: getSelectedDomain( {
				domains,
				selectedDomainName: ownProps.selectedDomainName,
			} ),
			currentRoute: getCurrentRoute( state ),
			domainsWithForwards: getDomainsWithForwards( state, domains ),
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( localize( TitanMailQuantitySelection ) );
