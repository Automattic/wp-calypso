/**
 * Extrenal dependencies
 *
 * @format
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */

const placeHolderValidationErrors = {
	organization: 'Yay!',
	address1: 'Yay!',
	extra: {
		registrantType: "It's broken!",
	},
};

const WithContactDetailsValidation = ( tld, WrappedComponent ) => {
	return class FormWithValidation extends Component {
		// TODO: componentWillUpdate needs to be deep

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					markedValidated
					contactDetailsValidationErrors={ placeHolderValidationErrors }
				/>
			);
		}
	};
};

export default WithContactDetailsValidation;
