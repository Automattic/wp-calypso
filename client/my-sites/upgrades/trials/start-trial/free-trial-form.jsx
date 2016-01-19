/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import { cartItems } from 'lib/cart-values';
import TransactionStepsMixin from 'my-sites/upgrades/checkout/transaction-steps-mixin';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import { clearSitePlans, fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySiteId } from 'state/sites/plans/selectors';

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

	isLoading: function() {
		return ! cartItems.hasFreeTrial( this.props.cart );
	},

	render: function() {
		if ( this.isLoading() ) {
			return (
				<FreeTrialConfirmationBox.Placeholder />
			);
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

