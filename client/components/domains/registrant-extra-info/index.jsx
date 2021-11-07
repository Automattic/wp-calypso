import config from '@automattic/calypso-config';
import { keys, filter } from 'lodash';
import { PureComponent } from 'react';
import { getTopLevelOfTld } from 'calypso/lib/domains';
import ca from './ca-form';
import fr from './fr-form';
import uk from './uk-form';

import './style.scss';

const tldSpecificForms = {
	ca,
	fr,
	uk,
};

export const getApplicableTldsWithAdditionalDetailsForms = ( tlds ) => {
	const topLevelTlds = tlds.map( getTopLevelOfTld );
	return filter( keys( tldSpecificForms ), ( tldFormName ) => {
		return (
			config.isEnabled( `domains/cctlds/${ tldFormName }` ) && topLevelTlds.includes( tldFormName )
		);
	} );
};

export default class DomainDetailsForm extends PureComponent {
	render() {
		const { tld, ...props } = this.props;
		const TldSpecificForm = tldSpecificForms[ getTopLevelOfTld( tld ) ];

		if ( ! TldSpecificForm ) {
			throw new Error( 'unrecognized tld in extra info form:', tld );
		}

		return <TldSpecificForm { ...props } />;
	}
}
