/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default class extends React.Component {
	static displayName = 'UserItem';

	static propTypes = {
		user: React.PropTypes.object
	};

	render() {
		let user = this.props.user || null,
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
}
