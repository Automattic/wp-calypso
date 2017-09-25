/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default class UserItem extends Component {
	static displayName = 'UserItem';

	static propTypes = {
		user: PropTypes.object
	};

	render() {
		const user = this.props.user || null;
		const name = user ? user.name : '';
		return (
			<div className="user" title={ name }>
				<Gravatar size={ 26 } user={ user } />
				<span className="user__name">
					{ name }
				</span>
			</div>
		);
	}
}
