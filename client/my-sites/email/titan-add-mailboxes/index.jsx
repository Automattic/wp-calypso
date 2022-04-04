import { Button, Card } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getMaxTitanMailboxCount,
	getTitanExpiryDate,
	getTitanMailboxPurchaseCost,
	getTitanMailboxRenewalCost,
	getTitanProductName,
	getTitanProductSlug,
	hasTitanMailWithUs,
	isTitanMonthlyProduct,
} from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import {
	areAllMailboxesValid,
	areAllMailboxesAvailable,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailPricingNotice from 'calypso/my-sites/email/email-pricing-notice';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import {
	emailManagement,
	emailManagementNewTitanAccount,
	emailManagementTitanSetUpMailbox,
} from 'calypso/my-sites/email/paths';
import TitanUnusedMailboxesNotice from 'calypso/my-sites/email/titan-add-mailboxes/titan-unused-mailbox-notice';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

class TitanAddMailboxes extends Component {
	state = {
		mailboxes: [ buildNewTitanMailbox( this.props.selectedDomainName, false ) ],
		isAddingToCart: false,
		isCheckingAvailability: false,
		validatedMailboxUuids: [],
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	recordClickEvent = ( eventName, eventProps ) => {
		const { recordTracksEvent, selectedDomainName, source } = this.props;
		recordTracksEvent( eventName, {
			...eventProps,
			domain_name: selectedDomainName,
			provider: TITAN_PROVIDER_NAME,
			source,
		} );
	};

	goToEmail = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
			source,
		} = this.props;

		page(
			emailManagement(
				selectedSite.slug,
				isSelectedDomainNameValid ? selectedDomainName : null,
				currentRoute,
				{ source }
			)
		);
	};

	handleCancel = () => {
		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_cancel_button_click' );
		this.goToEmail();
	};

	getCartItem = () => {
		const { maxTitanMailboxCount, selectedDomainName, titanMailProduct } = this.props;
		const mailboxes = this.state.mailboxes;
		const quantity = mailboxes.length + maxTitanMailboxCount;
		const new_quantity = mailboxes.length;
		const email_users = mailboxes.map( transformMailboxForCart );

		const cartItemFunction = isTitanMonthlyProduct( titanMailProduct )
			? titanMailMonthly
			: titanMailYearly;

		return cartItemFunction( {
			domain: selectedDomainName,
			quantity,
			extra: {
				email_users,
				new_quantity,
			},
		} );
	};

	handleContinue = async () => {
		const { selectedSite } = this.props;
		const { mailboxes } = this.state;

		const validatedMailboxes = validateMailboxes( mailboxes );

		const allMailboxesAreValid = areAllMailboxesValid( validatedMailboxes );

		let allMailboxesAreAvailable = false;
		if ( allMailboxesAreValid ) {
			this.setState( { isCheckingAvailability: true } );
			allMailboxesAreAvailable = await areAllMailboxesAvailable(
				validatedMailboxes,
				this.onMailboxesChange
			);
			if ( this.isMounted ) {
				this.setState( { isCheckingAvailability: false } );
			}
		}

		const canContinue = allMailboxesAreValid && allMailboxesAreAvailable;

		const validatedMailboxUuids = validatedMailboxes.map( ( mailbox ) => mailbox.uuid );

		this.setState( {
			mailboxes: validatedMailboxes,
			validatedMailboxUuids,
		} );

		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_continue_button_click', {
			can_continue: canContinue,
			mailbox_count: mailboxes.length,
		} );

		if ( canContinue ) {
			this.setState( { isAddingToCart: true } );

			this.props.shoppingCartManager
				.addProductsToCart( [ this.getCartItem() ] )
				.then( () => {
					if ( this.isMounted ) {
						this.setState( { isAddingToCart: false } );
						page( '/checkout/' + selectedSite.slug );
					}
				} )
				.catch( () => {
					if ( this.isMounted ) {
						this.setState( { isAddingToCart: false } );
					}
				} );
		}
	};

	handleUnusedMailboxFinishSetupClick = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
		} = this.props;

		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_create_mailbox_click' );

		page(
			emailManagementTitanSetUpMailbox(
				selectedSite.slug,
				isSelectedDomainNameValid ? selectedDomainName : null,
				currentRoute
			)
		);
	};

	onMailboxesChange = ( updatedMailboxes ) => {
		this.setState( { mailboxes: updatedMailboxes } );
	};

	renderForm() {
		const { isLoadingDomains, selectedDomainName, titanMailProduct, translate } = this.props;

		if ( isLoadingDomains || ! titanMailProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<TitanNewMailboxList
						selectedDomainName={ selectedDomainName }
						mailboxes={ this.state.mailboxes }
						onMailboxesChange={ this.onMailboxesChange }
						validatedMailboxUuids={ this.state.validatedMailboxUuids }
					>
						<div className="titan-add-mailboxes__buttons">
							<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>

							<Button
								primary
								busy={ this.state.isAddingToCart || this.state.isCheckingAvailability }
								onClick={ this.handleContinue }
							>
								{ translate( 'Continue' ) }
							</Button>
						</div>
					</TitanNewMailboxList>
				</Card>
			</>
		);
	}

	render() {
		const {
			currentRoute,
			isLoadingDomains,
			isSelectedDomainNameValid,
			maxTitanMailboxCount,
			selectedDomain,
			selectedDomainName,
			selectedSite,
			titanMailProduct,
			translate,
		} = this.props;

		if ( ! isLoadingDomains && ! isSelectedDomainNameValid ) {
			this.goToEmail();
			return null;
		}

		const analyticsPath = emailManagementNewTitanAccount( ':site', ':domain', currentRoute );

		return (
			<>
				<PageViewTracker path={ analyticsPath } title="Email Management > Add Titan Mailboxes" />

				<QueryProductsList />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

					<EmailHeader />

					<HeaderCake onClick={ this.goToEmail }>
						{ getTitanProductName() + ': ' + selectedDomainName }
					</HeaderCake>

					{ selectedDomain && (
						<TitanUnusedMailboxesNotice
							domain={ selectedDomain }
							maxTitanMailboxCount={ maxTitanMailboxCount }
							onFinishSetupClick={ this.handleUnusedMailboxFinishSetupClick }
						/>
					) }

					{ selectedDomain && titanMailProduct && hasTitanMailWithUs( selectedDomain ) && (
						<EmailPricingNotice
							domain={ selectedDomain }
							expiryDate={ getTitanExpiryDate( selectedDomain ) }
							mailboxRenewalCost={ getTitanMailboxRenewalCost( selectedDomain ) }
							mailboxPurchaseCost={ getTitanMailboxPurchaseCost( selectedDomain ) }
							product={ titanMailProduct }
							isMonthlyBilling={ isTitanMonthlyProduct( titanMailProduct ) }
						/>
					) }
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
		const selectedDomain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );

		const productSlug = getTitanProductSlug( selectedDomain );

		return {
			selectedDomain,
			selectedSite,
			isLoadingDomains,
			currentRoute: getCurrentRoute( state ),
			maxTitanMailboxCount: hasTitanMailWithUs( selectedDomain )
				? getMaxTitanMailboxCount( selectedDomain )
				: 0,
			titanMailProduct: productSlug ? getProductBySlug( state, productSlug ) : null,
			isSelectedDomainNameValid: !! selectedDomain,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withCartKey( withShoppingCart( withLocalizedMoment( localize( TitanAddMailboxes ) ) ) ) );
