/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordGoogleEvent } from '../../state/analytics/actions';
import U2FItem from './item';

import './style.scss';

class SecurityU2fKeyList extends React.Component {
	render() {
		return (
			<div className="security-u2f-key__active-keys">
				<FormSectionHeading>{ this.props.translate( 'Active keys' ) }</FormSectionHeading>
				<ul className="security-u2f-key__list">
					{ this.props.keys.map( key => (
						<li key={ key } className="security-u2f-key__list-item">
							<U2FItem key={ key } />
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
