/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getWhoisData } from 'state/domains/management/selectors';
import { requestWhois } from 'state/domains/management/actions';
import { isEmpty } from 'lodash';
import { findRegistrantWhois, findPrivacyServiceWhois } from 'lib/domains/whois/utils';

class ContactDisplay extends React.PureComponent {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
	};

	fetchWhois = () => {
		if ( isEmpty( this.props.whoisData ) && ! isEmpty( this.props.selectedDomainName ) ) {
			this.props.requestWhois( this.props.selectedDomainName );
		}
	};

	render() {
		const { privateDomain, translate, whoisData } = this.props;

		const contactInformation = privateDomain
			? findPrivacyServiceWhois( whoisData )
			: findRegistrantWhois( whoisData );

		if ( isEmpty( contactInformation ) ) {
			this.fetchWhois();
			return null;
		}

		return (
			<div className="contact-display">
				<h2>{ translate( 'Public Record Preview' ) }</h2>

				<div className="contact-display__content">
					<p>
						{ contactInformation.fname } { contactInformation.lname }
					</p>
					{ contactInformation.org && <p>{ contactInformation.org }</p> }
					<p>{ contactInformation.email }</p>
					<p>{ contactInformation.sa1 }</p>
					{ contactInformation.sa2 && <p>{ contactInformation.sa2 }</p> }
					<p>
						{ contactInformation.city }
						{ contactInformation.sp && <span>, { contactInformation.sp }</span> }
						<span> { contactInformation.pc }</span>
					</p>
					<p>{ contactInformation.country_code }</p>
					<p>{ contactInformation.phone }</p>
					{ contactInformation.fax && <p>{ contactInformation.fax }</p> }
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			whoisData: getWhoisData( state, ownProps.selectedDomainName ),
		};
	},
	{
		requestWhois,
	}
)( localize( ContactDisplay ) );
