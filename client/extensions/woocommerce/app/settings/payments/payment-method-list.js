/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import PaymentMethodItem from './payment-method-item';
import PaymentMethodItemPlaceholder from './payment-method-item-placeholder';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import { fetchPaymentMethods } from 'woocommerce/state/sites/payment-methods/actions';
import { arePaymentMethodsLoaded } from 'woocommerce/state/sites/payment-methods/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getPaymentMethodsGroup } from 'woocommerce/state/ui/payments/methods/selectors';

class SettingsPaymentsMethodList extends Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		fetchPaymentMethods: PropTypes.func.isRequired,
		methodType: PropTypes.string.isRequired,
		paymentMethods: PropTypes.array.isRequired,
		site: PropTypes.object,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchPaymentMethods( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPaymentMethods( newSiteId );
		}
	}

	renderMethodItem = ( method ) => {
		const { site } = this.props;
		// Disable BACS and Cheque payment for now until #16630 and #16629 are fixed.
		if ( 'bacs' === method.id ) {
			return null;
		}

		return (
			<PaymentMethodItem method={ method } key={ method.title } site={ site } />
		);
	}

	showPlaceholder = () => {
		return (
			<PaymentMethodItemPlaceholder />
		);
	}

	render() {
		const { isLoading, methodType, paymentMethods, translate } = this.props;

		return (
			<List>
				<ListHeader>
					<ListItemField className="payments__methods-column-method">
						{ translate( 'Method' ) }
					</ListItemField>
					{ methodType !== 'offline' && (
						<ListItemField className="payments__methods-column-fees">
							{ translate( 'Fees' ) }
						</ListItemField>
					) }
					<ListItemField className="payments__methods-column-settings">
					</ListItemField>
				</ListHeader>
				{ isLoading && this.showPlaceholder() }
				{ paymentMethods && paymentMethods.map( this.renderMethodItem ) }
			</List>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const paymentMethods = getPaymentMethodsGroup( state, ownProps.methodType );
	const site = getSelectedSiteWithFallback( state );
	const isLoading = ! arePaymentMethodsLoaded( state );
	return {
		isLoading,
		paymentMethods,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPaymentMethods,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsMethodList )
);
