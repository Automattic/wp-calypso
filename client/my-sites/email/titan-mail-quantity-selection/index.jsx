/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import {
	emailManagement,
	emailManagementManageTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
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
import NoticeAction from 'calypso/components/notice/notice-action';
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
import {
	TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
	TITAN_MAIL_MONTHLY_SLUG,
} from 'calypso/lib/titan/constants';
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
			.then( () => {
				const { errors } = this.props?.cart?.messages;
				const errorCodesToDisplayLocally = [ 'invalid-quantity', 'missing_quantity_data' ];
				if (
					errors &&
					errors.length &&
					errors.filter( ( error ) => errorCodesToDisplayLocally.includes( error.code ) ).length
				) {
					// Stay on the page to show the relevant error
					return;
				}
				return this.isMounted && page( '/checkout/' + selectedSite.slug );
			} );
	};

	handleCreateMailbox = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
		} = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_create_mailbox_click'
		);

		const domainName = isSelectedDomainNameValid ? selectedDomainName : null;

		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			page(
				emailManagementManageTitanAccount( selectedSite.slug, domainName, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				} )
			);

			return;
		}

		window.open(
			emailManagementTitanControlPanelRedirect( selectedSite.slug, domainName, currentRoute, {
				context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			} )
		);
	};

	onButtonClick = () => {
		this.setState( { quantity: this.state.quantity + 1 } );
	};

	onQuantityChange = ( event ) => {
		const { target } = event;

		const parsedQuantity = parseInt( target.value, 10 );
		const quantity = isNaN( parsedQuantity ) ? 1 : Math.max( 1, parsedQuantity );

		if ( quantity.toString() !== target.value ) {
			target.value = quantity;
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

	renderUnusedMailboxesNotice() {
		const { maxTitanMailboxCount, selectedDomain, translate } = this.props;

		if ( ! hasTitanMailWithUs( selectedDomain ) ) {
			return null;
		}

		const numberOfUnusedMailboxes =
			maxTitanMailboxCount - getConfiguredTitanMailboxCount( selectedDomain );

		if ( numberOfUnusedMailboxes <= 0 ) {
			return;
		}

		const text = translate(
			'You have %(numberOfMailboxes)d unused mailbox. Do you want to configure it now instead?',
			'You have %(numberOfMailboxes)d unused mailboxes. Do you want to configure them now instead?',
			{
				count: numberOfUnusedMailboxes,
				args: {
					numberOfMailboxes: numberOfUnusedMailboxes,
				},
				comment: 'This refers to the number of mailboxes purchased that have not been set up yet',
			}
		);

		return (
			<Notice icon="notice" showDismiss={ false } status="is-warning" text={ text }>
				<NoticeAction
					external={ ! isEnabled( 'titan/iframe-control-panel' ) }
					onClick={ this.handleCreateMailbox }
				>
					{ translate( 'Finish Setup' ) }
				</NoticeAction>
			</Notice>
		);
	}

	renderNewMailboxesNotice() {
		const { moment, selectedDomain, translate } = this.props;

		if ( ! hasTitanMailWithUs( selectedDomain ) ) {
			return null;
		}

		const purchaseCost = getTitanMailboxPurchaseCost( selectedDomain );

		if ( this.doesAdditionalPriceMatchStandardPrice() ) {
			return (
				<Notice icon="info-outline" showDismiss={ false } status="is-success">
					{ translate(
						'You can purchase new mailboxes at the regular price of {{strong}}%(price)s{{/strong}} per mailbox per month.',
						{
							args: {
								price: purchaseCost.text,
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50)',
						}
					) }
				</Notice>
			);
		}
		const renewalCost = getTitanMailboxRenewalCost( selectedDomain );
		const expiryDate = getTitanExpiryDate( selectedDomain );

		return (
			<Notice icon="info-outline" showDismiss={ false } status="is-success">
				<>
					{ translate(
						'You can purchase new mailboxes at the prorated price of {{strong}}%(proratedPrice)s{{/strong}} per mailbox.',
						{
							args: {
								proratedPrice: purchaseCost.text,
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(proratedPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50)',
						}
					) }{ ' ' }
					{ purchaseCost.amount < renewalCost.amount
						? translate(
								'This is less than the regular price because you are only charged for the remainder of the current month.'
						  )
						: translate(
								'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
						  ) }{ ' ' }
					{ translate(
						'All of your mailboxes are due to renew at the regular price of {{strong}}%(fullPrice)s{{/strong}} per mailbox when your subscription renews on {{strong}}%(expiryDate)s{{/strong}}.',
						{
							args: {
								fullPrice: renewalCost.text,
								expiryDate: moment( expiryDate ).format( 'LL' ),
							},
							components: {
								strong: <strong />,
							},
							comment:
								'%(fullPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50), ' +
								'%(expiryDate)s is a localized date (e.g. February 17, 2021)',
						}
					) }
				</>
			</Notice>
		);
	}

	renderForm() {
		const { isLoadingDomains, titanMonthlyProduct, translate } = this.props;

		if ( isLoadingDomains || ! titanMonthlyProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<div className="titan-mail-quantity-selection__form">
						<FormLabel htmlFor="quantity">{ translate( 'Number of mailboxes' ) }</FormLabel>

						<FormTextInput
							name="quantity"
							id="quantity"
							type="number"
							min="1"
							max="50"
							step="1"
							placeholder={ translate( 'Number of mailboxes' ) }
							value={ this.state.quantity }
							onChange={ this.onQuantityChange }
						/>

						<Button onClick={ this.onButtonClick }>
							<Gridicon icon="plus" />

							<span>{ translate( 'Add another mailbox' ) }</span>
						</Button>
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
						{ getTitanProductName() + ': ' + selectedDomainName }
					</DomainManagementHeader>

					{ this.renderForwardsNotice() }
					{ this.renderUnusedMailboxesNotice() }
					{ this.renderNewMailboxesNotice() }
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
