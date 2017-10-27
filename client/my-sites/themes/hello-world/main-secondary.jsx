/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Gridicon from 'gridicons';

export default class HelloWorldSecondary extends React.Component {
	render() {
		return (
			<Main>
				<h1>Hello Secondary Component</h1>
				<Gridicon icon="ellipsis" />
			</Main>
		);
	}
}
