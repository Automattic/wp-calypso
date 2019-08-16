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
import { find, isEmpty } from 'lodash';

class ContactDisplay extends React.PureComponent {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
	};

	componentDidUpdate() {
		this.fetchWhois();
	}

	fetchWhois = () => {
		if ( isEmpty( this.props.whoisData ) && ! isEmpty( this.props.selectedDomainName ) ) {
			this.props.requestWhois( this.props.selectedDomainName );
		}
	};

	render() {
		const { translate, whoisData } = this.props;
		const registrantWhoisData = find( whoisData, { type: 'registrant' } );

		if ( isEmpty( registrantWhoisData ) ) {
			return null;
		}

		return (
			<div className="contact-display">
				<h2>{ translate( 'Public Record Preview' ) }</h2>

				<div className="contact-display__content">
					<p>
						{ registrantWhoisData.fname } { registrantWhoisData.lname }
					</p>
					{ registrantWhoisData.org && <p>{ registrantWhoisData.org }</p> }
					<p>{ registrantWhoisData.email }</p>
					<p>{ registrantWhoisData.sa1 }</p>
					{ registrantWhoisData.sa2 && <p>{ registrantWhoisData.sa2 }</p> }
					<p>
						{ registrantWhoisData.city }
						{ registrantWhoisData.sp && <span>, { registrantWhoisData.sp }</span> }
						<span> { registrantWhoisData.pc }</span>
					</p>
					<p>{ registrantWhoisData.country_code }</p>
					<p>{ registrantWhoisData.phone }</p>
					{ registrantWhoisData.fax && <p>{ registrantWhoisData.fax }</p> }
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
