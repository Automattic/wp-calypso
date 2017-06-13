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

export default class JetpackDiscussion extends PureComponent {
	render() {
		return (
			<Main className="discussion jetpack-ui__discussion">
				<Card>
					<h1>Discussion</h1>
					<p>Settings, or something, would go here.</p>
					<Button onClick={ this.props.loadPage( '/writing' ) }>Writing</Button>
				</Card>
			</Main>
		);
	}
}
