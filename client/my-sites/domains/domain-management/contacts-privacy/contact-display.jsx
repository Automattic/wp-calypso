/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';

class ContactDisplay extends React.PureComponent {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired
	};

	render() {
		const { contactInformation, translate } = this.props;

		return (
			<div className="contact-display">
				<h2>{ translate( 'Public Record Preview' ) }</h2>

				<div className="contact-display-content">
					<p>{ contactInformation.firstName } { contactInformation.lastName }</p>
					{ contactInformation.organization && <p>{ contactInformation.organization }</p> }
					<p>{ contactInformation.email }</p>
					<p>{ contactInformation.address1 }</p>
					{ contactInformation.address2 && <p>{ contactInformation.address2 }</p> }
					<p>
						{ contactInformation.city }
						{ contactInformation.stateName && <span>, { contactInformation.stateName }</span> }
						<span> { contactInformation.postalCode }</span>
					</p>
					<p>{ contactInformation.countryName }</p>
					<p>{ contactInformation.phone }</p>
					{ contactInformation.fax && <p>{ contactInformation.fax }</p> }
				</div>
			</div>
		);
	}
}

export default localize( ContactDisplay );
