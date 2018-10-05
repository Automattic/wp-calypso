/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordGoogleEvent } from '../../state/analytics/actions';
import U2FItem from './item';

import './style.scss';

class SecurityU2fKeyList extends React.Component {
	static propTypes = {
		securityKeys: PropTypes.array.isRequired,
	};

	render() {
		return (
			<div className="security-u2f-key__active-keys">
				<FormSectionHeading>{ this.props.translate( 'Active keys' ) }</FormSectionHeading>
				<ul className="security-u2f-key__list">
					{ this.props.securityKeys.map( securityKey => (
						<li key={ securityKey.id } className="security-u2f-key__list-item">
							<U2FItem securityKey={ securityKey } />
						</li>
					) ) }
				</ul>
			</div>
		);
	}
}

export default connect(
	state => ( { state } ),
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKeyList ) );
