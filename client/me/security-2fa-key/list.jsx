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
import { recordGoogleEvent } from '../../state/analytics/actions';
import Security2faKeyItem from './item';

/**
 * Style dependencies
 */
import './style.scss';

function Security2faKeyList( props ) {
	return (
		<div className="security-2fa-key__active-keys">
			<ul className="security-2fa-key__list">
				{ props.securityKeys.map( ( securityKey ) => (
					<li key={ securityKey.id } className="security-2fa-key__list-item">
						<Security2faKeyItem securityKey={ securityKey } onDelete={ props.onDelete } />
					</li>
				) ) }
			</ul>
		</div>
	);
}

Security2faKeyList.propTypes = {
	securityKeys: PropTypes.array.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default connect( null, {
	recordGoogleEvent,
} )( localize( Security2faKeyList ) );
