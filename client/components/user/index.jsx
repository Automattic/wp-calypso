/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

module.exports = React.createClass( {
	displayName: 'UserItem',
	propTypes: {
		user: PropTypes.object
	},

	render: function() {
		var user = this.props.user || null,
		name = user ? user.name : '';
		return (
			<div className="user" title={ name }>
				<Gravatar size={ 26 } user={ user } />
				<span className="user__name">
					{ name }
				</span>
			</div>
		);
	}
} );
