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
import Banner from 'components/banner';
import FoldableCard from 'components/foldable-card';

export default class JetpackWriting extends PureComponent {
	render() {
		return (
			<Main className="writing jetpack-ui__writing">
				<Card>
					<h1>Writing</h1>
					<p>Settings, or something, would go here.</p>
					<Button onClick={ this.props.loadPage( '/test/discussion' ) }>Discussion</Button>
				</Card>
				<Banner title="WFT" description={ 'WTF!! A banner that works both in calypso and wp-admin?!?!?' } />
				<FoldableCard header={ 'A foldable card, also?' }>WOW!</FoldableCard>
			</Main>
		);
	}
}
