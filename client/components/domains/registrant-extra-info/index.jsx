/**
 * External dependencies
 */
import { keys, filter } from 'lodash';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ca from './ca-form';
import fr from './fr-form';
import config from 'config';

const tldSpecificForms = {
	ca,
	fr,
};

const enabledTldForms = filter(
	keys( tldSpecificForms ),
	tld => config.isEnabled( `domains/cctlds/${ tld }` )
);

export const tldsWithAdditionalDetailsForms = enabledTldForms;

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
