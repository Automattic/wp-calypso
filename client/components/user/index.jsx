/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gravatar from 'calypso/components/gravatar';

/**
 * Style dependencies
 */
import './style.scss';

export default class User extends Component {
	static displayName = 'User';

	static propTypes = {
		user: PropTypes.object,
	};

	render() {
		const user = this.props.user || null;
		const name = user ? user.display_name || user.name : '';
		return (
			<div className="user" title={ name }>
				<Gravatar size={ 26 } user={ user } />
				<span className="user__name">{ name }</span>
			</div>
		);
	}
}
