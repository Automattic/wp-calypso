/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Notice from 'calypso/components/notice';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getConfiguredTitanMailboxCount,
	getTitanExpiryDate,
	getTitanMailboxPurchaseCost,
	getTitanMailboxRenewalCost,
	getMaxTitanMailboxCount,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getTitanProductName } from 'calypso/lib/titan/get-titan-product-name';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class TitanMailQuantitySelection extends React.Component {
	state = {
		quantity: 1,
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

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
				this.props.isSelectedDomainNameValid ? this.props.selectedDomainName : null,
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
		const { maxTitanMailboxCount, selectedDomainName } = this.props;
		const quantity = this.state.quantity + maxTitanMailboxCount;
		const new_quantity = this.state.quantity;
		return titanMailMonthly( { domain: selectedDomainName, quantity, extra: { new_quantity } } );
	};

	handleContinue = () => {
		const { selectedSite } = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_continue_button_click'
		);

		this.props.shoppingCartManager
			.addProductsToCart( [
				fillInSingleCartItemAttributes( this.getCartItem(), this.props.productsList ),
			] )
			.then( () => this.isMounted && page( '/checkout/' + selectedSite.slug ) );
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
							productName: getTitanProductName(),
						},
						comment: '%(productName)s is the name of the product, e.g. Titan Mail or Email',
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

	renderCurrentMailboxCounts() {
		const { selectedDomain, translate } = this.props;
		if ( ! hasTitanMailWithUs( selectedDomain ) ) {
			return null;
		}

		const purchasedMailboxCount = getMaxTitanMailboxCount( selectedDomain );
		if ( purchasedMailboxCount < 1 ) {
			return null;
		}

		const configuredMailboxCount = getConfiguredTitanMailboxCount( selectedDomain );
		if ( configuredMailboxCount >= purchasedMailboxCount ) {
			return (
				<CompactCard>
					<span>
						{ translate(
							'You currently have %(mailboxCount)d mailbox for this domain',
							'You currently have %(mailboxCount)d mailboxes for this domain',
							{
								args: {
									mailboxCount: configuredMailboxCount,
								},
								count: configuredMailboxCount,
								comment:
									'%(mailboxCount)d is the number of email mailboxes the user has for a domain name',
							}
						) }
					</span>
				</CompactCard>
			);
		}

		const unusedMailboxCount = purchasedMailboxCount - configuredMailboxCount;
		return (
			<CompactCard>
				<span>
					{ translate(
						'You have already bought %(mailboxCount)d mailbox for this domain',
						'You have already bought %(mailboxCount)d mailboxes for this domain',
						{
							args: {
								mailboxCount: purchasedMailboxCount,
							},
							count: purchasedMailboxCount,
							comment:
								'%(mailboxCount)d is the number of email mailboxes the user has bought for the domain',
						}
					) }
				</span>
				<span>
					{ translate(
						'You still have %(unusedMailboxCount)d unused mailbox',
						'You still have %(unusedMailboxCount)d unused mailboxes',
						{
							args: {
								unusedMailboxCount,
							},
							count: unusedMailboxCount,
							comment:
								'%(unusedMailboxCount)d is the number of unused mailboxes that the user has paid for but is not using',
						}
					) }
				</span>
			</CompactCard>
		);
	}

	doesAdditionalPriceMatchStandardPrice() {
		const { selectedDomain, titanMonthlyProduct } = this.props;
		if ( ! selectedDomain || ! hasTitanMailWithUs( selectedDomain ) ) {
			return true;
		}
		const costPerAdditionalMailbox = getTitanMailboxPurchaseCost( selectedDomain );
		if ( ! costPerAdditionalMailbox ) {
			return true;
		}
		return (
			costPerAdditionalMailbox.amount === titanMonthlyProduct.cost &&
			costPerAdditionalMailbox.currency === titanMonthlyProduct.currency_code
		);
	}

	renderPricingDetails() {
		const { moment, selectedDomain, titanMonthlyProduct, translate } = this.props;

		const pricingTitle = <h3>{ translate( 'Pricing' ) }</h3>;
		// Handle cases where we're only dealing with the standard price
		if ( this.doesAdditionalPriceMatchStandardPrice() ) {
			return (
				<React.Fragment>
					{ pricingTitle }
					<span>
						{ translate( 'Each mailbox costs {{strong}}%(price)s/month{{/strong}}', {
							args: {
								price: titanMonthlyProduct.cost_display,
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(price)s is a formatted price for each mailbox, e.g. $3.50, €3.75, or PLN 3.75',
						} ) }
					</span>
				</React.Fragment>
			);
		}

		const purchaseCost = getTitanMailboxPurchaseCost( selectedDomain );
		const renewalCost = getTitanMailboxRenewalCost( selectedDomain );
		const expiryDate = getTitanExpiryDate( selectedDomain );

		const prorationMessage =
			purchaseCost.amount < renewalCost.amount
				? translate(
						'Your initial purchase price is less than your standard monthly price of %(price)s per mailbox because ' +
							"we're only charging you for the remainder of the current month.",
						{
							args: {
								price: renewalCost.text,
							},
							comment:
								'%(price)s is a formatted price for a monthly email mailbox subscription, e.g. $3.50, €3.75, or PLN 4.50',
						}
				  )
				: translate(
						'Your initial purchase price is more than your standard monthly price of %(price)s per mailbox because ' +
							"we're charging you for the remainder of the current month plus one or more months of service.",
						{
							args: {
								price: renewalCost.text,
							},
							comment:
								'%(price)s is a formatted price for a monthly email mailbox subscription, e.g. $3.50, €3.75, or PLN 4.50',
						}
				  );

		return (
			<React.Fragment>
				{ pricingTitle }
				<span>
					{ translate(
						'Each additional mailbox will cost {{strong}}%(price)s{{/strong}} for this purchase',
						{
							args: {
								price: purchaseCost.text,
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(price)s is a formatted price for each email mailbox, e.g. $3.50, €3.75, or PLN 4.50',
						}
					) }
				</span>
				<span>
					{ translate(
						'All of your mailboxes are due to renew at {{strong}}%(price)s/mailbox/month{{/strong}} on %(date)s',
						{
							args: {
								date: moment( expiryDate ).format( 'LL' ),
								price: renewalCost.text,
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(price)s is a formatted price for each mailbox, e.g. $3.50, €3.75, or PLN 4.50; ' +
								'%(date)s is a localized date of the rough form: 17 February 2021',
						}
					) }
				</span>
				<CompactCard className="titan-mail-quantity-selection__prorating-details">
					<Gridicon icon="info-outline" size={ 18 } />
					<span>{ prorationMessage }</span>
				</CompactCard>
			</React.Fragment>
		);
	}

	renderForm() {
		const { isLoadingDomains, selectedDomainName, titanMonthlyProduct, translate } = this.props;

		if ( isLoadingDomains || ! titanMonthlyProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Choose Mailbox Quantity' ) } />

				<Card>
					<div className="titan-mail-quantity-selection__domain-info">
						{ translate( "You're adding mailboxes for {{strong}}%(domainName)s{{/strong}}", {
							args: {
								domainName: selectedDomainName,
							},
							components: {
								strong: <strong />,
							},
							comment: '%(domainName)s is a domain name',
						} ) }
					</div>
					<div className="titan-mail-quantity-selection__mailbox-info">
						{ this.renderCurrentMailboxCounts() }
					</div>
					<div>
						<FormLabel>{ translate( 'Number of new mailboxes to add' ) }</FormLabel>
						<FormTextInput
							name="quantity"
							type="number"
							min="1"
							placeholder={ translate( 'Number of new mailboxes' ) }
							value={ this.state.quantity }
							onChange={ this.onQuantityChange }
						/>
					</div>
					<hr className="titan-mail-quantity-selection__divider titan-mail-quantity-selection__divider-pricing" />
					<div className="titan-mail-quantity-selection__pricing-info">
						{ this.renderPricingDetails() }
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
		const {
			selectedDomainName,
			selectedSite,
			isSelectedDomainNameValid,
			isLoadingDomains,
			translate,
		} = this.props;

		if ( ! isLoadingDomains && ! isSelectedDomainNameValid ) {
			this.goToEmail();
			return null;
		}

		return (
			<>
				<QueryProductsList />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<Main>
					<DomainManagementHeader
						onClick={ this.goToEmail }
						selectedDomainName={ selectedDomainName }
					>
						{ translate( '%(productName)s: %(domainName)s', {
							args: {
								domainName: selectedDomainName,
								productName: getTitanProductName(),
							},
							comment:
								'%(productName)s is the name of the product, either "Email" or "Titan Mail"; %(domainName)s is the name of a domain',
						} ) }
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
		const selectedDomain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );
		return {
			selectedDomain,
			selectedSite,
			isLoadingDomains,
			currentRoute: getCurrentRoute( state ),
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			productsList: getProductsList( state ),
			maxTitanMailboxCount: hasTitanMailWithUs( selectedDomain )
				? getMaxTitanMailboxCount( selectedDomain )
				: 0,
			titanMonthlyProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
			isSelectedDomainNameValid: !! selectedDomain,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withShoppingCart( withLocalizedMoment( localize( TitanMailQuantitySelection ) ) ) );
