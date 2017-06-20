/**
 * Extrenal dependencies
 */
import React, { PureComponent } from 'react';
import { keys } from 'lodash';

/**
 * Internal dependencies
 */
import fr from './fr-form';
import ca from './ca-form';

const tldSpecificForms = {
	ca,
	fr,
};

export const tldsWithAdditionalDetailsForms = keys( tldSpecificForms );

export default class DomainDetailsForm extends PureComponent {
	render() {
		const { tld, ...props } = this.props;
		const TldSpecificForm = tldSpecificForms[ tld ];

		if ( ! TldSpecificForm ) {
			throw new Error( 'unrecognized tld in extra info form:', tld );
		}

		return <TldSpecificForm { ...props } />;
	}
}
