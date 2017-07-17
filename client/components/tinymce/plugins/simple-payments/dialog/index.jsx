/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSimplePayments } from 'state/selectors';
import QuerySimplePayments from 'components/data/query-simple-payments';
import Dialog from 'components/dialog';
import Button from 'components/button';
import Navigation from './navigation';
import ProductForm from './form';
import ProductList from './list';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getCurrencyDefaults } from 'lib/format-currency';
import QuerySitePlans from 'components/data/query-site-plans';

class SimplePaymentsDialog extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'paymentButtons', 'addNew' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onInsert: PropTypes.func.isRequired,
	};

	state = {
		selectedPaymentId: null,
	};

	handleSelectedChange = selectedPaymentId => {
		this.setState( { selectedPaymentId } );
	};

	handleInsert = () => {
		this.props.onInsert( { id: this.state.selectedPaymentId } );
	};

	getActionButtons() {
		const { activeTab, translate, onClose } = this.props;

		const insertEnabled = activeTab === 'paymentButtons' && this.state.selectedPaymentId !== null;

		return [
			<Button onClick={ onClose }>
				{ translate( 'Cancel' ) }
			</Button>,
			<Button onClick={ this.handleInsert } disabled={ ! insertEnabled } primary>
				{ translate( 'Insert' ) }
			</Button>,
		];
	}

	render() {
		const {
			activeTab,
			showDialog,
			onChangeTabs,
			onClose,
			siteId,
			paymentButtons,
			currencyCode,
		} = this.props;

		const currencyDefaults = getCurrencyDefaults( currencyCode );

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-simple-payments-modal"
			>
				<QuerySimplePayments siteId={ siteId } />

				{ ! currencyCode && <QuerySitePlans siteId={ siteId } />}

				<Navigation { ...{ activeTab, onChangeTabs, paymentButtons } } />
				{ activeTab === 'addNew'
					? <ProductForm currencyDefaults={ currencyDefaults } />
					: <ProductList
							paymentButtons={ paymentButtons }
							selectedPaymentId={ this.state.selectedPaymentId }
							onSelectedChange={ this.handleSelectedChange }
						/> }
			</Dialog>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		paymentButtons: getSimplePayments( state, siteId ) || [],
		currencyCode: getCurrentUserCurrencyCode( state ),
	};
} )( localize( SimplePaymentsDialog ) );
