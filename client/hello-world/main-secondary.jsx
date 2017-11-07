/**
 * External dependencies
 *
 * @format
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
				<Gridicon icon="heading-h2" />
				<h1>Hello Secondary Component</h1>
			</Main>
		);
	}
}
