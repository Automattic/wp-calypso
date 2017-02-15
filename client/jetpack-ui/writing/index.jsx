/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';

export default class JetpackWriting extends PureComponent {
	render() {
		return (
			<Main className="writing jetpack-ui__writing">
				<Card>
					<h1>Writing</h1>
					<p>Settings, or something, would go here.</p>
					<Button href="/discussion">Discussion</Button>
				</Card>
			</Main>
		);
	}
}
