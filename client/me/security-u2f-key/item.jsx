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
import CompactCard from 'components/card/compact';
import { recordGoogleEvent } from '../../state/analytics/actions';
import U2FDeleteButton from './delete-item-button';

class SecurityU2fKeyItem extends Component {
	static propTypes = {
		onDelete: PropTypes.func.isRequired,
		securityKey: PropTypes.object.isRequired,
	};

	render() {
		return (
			<CompactCard>
				<div className="security-u2f-key__item">
					<div className="security-u2f-key__item-information">
						<h2 className="security-u2f-key__item-title">{ this.props.securityKey.registered }</h2>
					</div>
					<U2FDeleteButton
						securityKey={ this.props.securityKey }
						onDelete={ this.props.onDelete }
					/>
				</div>
			</CompactCard>
		);
	}
}

export default connect(
	state => ( { state } ),
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKeyItem ) );
