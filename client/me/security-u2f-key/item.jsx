/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { recordGoogleEvent } from '../../state/analytics/actions';
import U2FDeleteButton from './delete-item-button';

class SecurityU2fKeyItem extends Component {
	static propTypes = {
		securityKey: PropTypes.object.isRequired,
	};

	render() {
		return (
			<div className="security-u2f-key__item">
				<div className="security-u2f-key__item-information">
					<div className="security-u2f-key__item-title">
						Foo { this.props.securityKey.registered }
					</div>
					<div className="security-u2f-key__item-subtitle">Bar { this.props.securityKey.id }</div>
				</div>
				<U2FDeleteButton securityKey={ this.props.securityKey } />
			</div>
		);
	}
}

export default connect(
	state => ( { state } ),
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKeyItem ) );
