/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { noop } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { concatTitle } from 'lib/react-helpers';
import CreditCardPage from 'me/purchases/components/credit-card-page';
import DocumentHead from 'components/data/document-head';
import * as titles from 'me/payment-methods/titles';

class AddCreditCard extends Component {
	static propTypes = {
	};

	render() {
		return (
			<div>
				<DocumentHead title={ concatTitle( titles.paymentMethods, titles.addCreditCard ) } />
				<CreditCardPage
					goBack={ noop }
					recordFormSubmitEvent={ noop }
					successCallback={ noop }
					title={ titles.addCreditCard } />
			</div>
		);
	}
}

const mapDispatchToProps = {
};

export default connect( {}, mapDispatchToProps )( AddCreditCard );

export default AddCreditCard;
