/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getWhoisData } from 'calypso/state/domains/management/selectors';
import { requestWhois } from 'calypso/state/domains/management/actions';
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';

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
		const { whoisData } = this.props;

		const contactInformation = findRegistrantWhois( whoisData );

		if ( isEmpty( contactInformation ) ) {
			this.fetchWhois();
			return null;
		}

		return (
			<div className="contact-display">
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
)( ContactDisplay );
