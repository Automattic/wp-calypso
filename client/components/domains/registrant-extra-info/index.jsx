/**
 * Extrenal dependencies
 *
 */

import React, { PureComponent } from 'react';
import { keys, filter } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import ca from './ca-form';
import fr from './fr-form';
import uk from './uk-form';

/**
 * Style dependencies
 */
import './style.scss';

const tldSpecificForms = {
	ca,
	fr,
	uk,
};

const enabledTldForms = filter( keys( tldSpecificForms ), ( tld ) =>
	config.isEnabled( `domains/cctlds/${ tld }` )
);

export const tldsWithAdditionalDetailsForms = enabledTldForms;

export default class DomainDetailsForm extends PureComponent {
	render() {
		const { tld, ...props } = this.props;
		const topLevelOfTld = tld.substring( tld.lastIndexOf( '.' ) + 1 );
		const TldSpecificForm = tldSpecificForms[ topLevelOfTld ];

		if ( ! TldSpecificForm ) {
			throw new Error( 'unrecognized tld in extra info form:', tld );
		}

		return <TldSpecificForm { ...props } />;
	}
}
