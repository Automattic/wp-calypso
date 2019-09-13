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
import Security2faDeleteButton from './delete-item-button';

class Security2faKeyItem extends Component {
	static propTypes = {
		onDelete: PropTypes.func.isRequired,
		securityKey: PropTypes.object.isRequired,
	};

	render() {
		return (
			<CompactCard>
				<div className="security-2fa-key__item">
					<div className="security-2fa-key__item-information">
						<h2 className="security-2fa-key__item-title">
							{ this.props.securityKey.registered } Key
						</h2>
					</div>
					<Security2faDeleteButton
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
)( localize( Security2faKeyItem ) );
