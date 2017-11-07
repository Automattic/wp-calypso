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

export default class HelloWorldPrimary extends React.Component {
	render() {
		return (
			<Main>
				<Gridicon icon="heading-h1" />
				<h1>Hello Primary Component</h1>
			</Main>
		);
	}
}
