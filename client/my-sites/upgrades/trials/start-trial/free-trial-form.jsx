/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import find from 'lodash/collection/find';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import { cartItems } from 'lib/cart-values';
import plansList from 'lib/plans-list';
import { isPlan } from 'lib/products-values';
import PaymentBox from 'my-sites/upgrades/checkout/payment-box';
import TransactionStepsMixin from 'my-sites/upgrades/checkout/transaction-steps-mixin';
import { clearSitePlans, fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';

const plans = plansList();

const FreeTrialForm = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	componentDidMount: function() {
		this.props.fetchSitePlans( this.props.selectedSite.ID );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.selectedSite.ID !== nextProps.selectedSite.ID ) {
			this.props.fetchSitePlans( nextProps.selectedSite.ID );
		}
	},

	handleSubmit: function( event ) {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Free Trial Form' );

		// `submitTransaction` comes from the `TransactionStepsMixin`
		this.submitTransaction( event );

		// invalidate `sitePlans` (/sites/:site/plans)
		this.props.clearSitePlans( this.props.selectedSite.ID );

		// Refresh all sites (/sites) to have an updated `site.plan` value.
		Dispatcher.handleViewAction( {
			type: 'FETCH_SITES'
		} );
	},

	isCartLoading: function() {
		// The component is ready once the cart contains the free trial plan
		return ! cartItems.hasFreeTrial( this.props.cart );
	},

	getProductName() {
		const planProduct = find( this.props.cart.products, isPlan );
		return ( planProduct && planProduct.product_name ) || '';
	},

	render: function() {
		if ( this.isCartLoading() ) {
			return (
				<FreeTrialConfirmationBox.Placeholder />
			);
		}

		const planSlug = plans.getSlugFromPath( this.props.planName );
		const hasTrialForThisPlan = this.props.selectedSite.plan.free_trial && this.props.selectedSite.plan.product_slug === planSlug;

		// Do not display a placeholder while the sitePlans are loading
		// It is just needed to check if site is eligible
		if ( hasTrialForThisPlan || this.props.sitePlans.hasLoadedFromServer ) {
			const plan = find( this.props.sitePlans.data || [], { productSlug: planSlug } );
			if ( hasTrialForThisPlan || plan && ! plan.canStartTrial ) {
				return (
					<PaymentBox
						classSet="credits-payment-box selected"
						contentClassSet="selected" >
						<div className="payment-box-section">
							<h6>
							{
								this.translate( 'The %(productName)s plan free trial is not available for your site', { args: { productName: this.getProductName() } } )
							}
							</h6>
							<span>
							{
								hasTrialForThisPlan
									? this.translate( 'You already are in a 14 days free trial for %(siteName)s', { args: { siteName: this.props.selectedSite.slug } } )
									: this.translate( 'You already had a 14 days free trial for %(siteName)s', { args: { siteName: this.props.selectedSite.slug } } )

							}
							</span>
						</div>
						<div className="payment-box-actions">
							<a className="button is-primary button-pay pay-button__button" href={ `/plans/${ this.props.selectedSite.slug }` }>
								Return to the Plans page
							</a>
						</div>
					</PaymentBox>
				);
			}
		}

		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				selected={ true }
				onSubmit={ this.handleSubmit }
				transactionStep={ this.props.transaction.step } />
		);
	}
} );

FreeTrialForm.Placeholder = FreeTrialConfirmationBox.Placeholder;

export default connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySiteId( state, props.selectedSite.ID )
		};
	},
	function mapDispatchToProps( dispatch ) {
		return {
			clearSitePlans( siteId ) {
				dispatch( clearSitePlans( siteId ) );
			},
			fetchSitePlans( siteId ) {
				dispatch( fetchSitePlans( siteId ) );
			}
		};
	}
)( FreeTrialForm );

