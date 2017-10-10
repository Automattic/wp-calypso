/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
//import Header from './card/header';
//import Property from './card/property';
/*
					<Header { ...this.props } />

					<Card>
						<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
							{ translate( 'Registered Domain' ) }
						</Property>
						<Property
							label={ translate( 'Registered on', {
								comment:
								'The corresponding date is in a different cell in the UI, ' +
								'the date is not included within the translated string',
							} ) }
						>
							{ domain.registrationMoment.format( 'LL' ) }
						</Property>
					</Card>
					*/

class TransferDomainPrecheck extends React.PureComponent {
	render() {
		return (
			<div>
				<div className="domain-details-card">
				</div>
			</div>
		);
	}
}

export default localize( TransferDomainPrecheck );
