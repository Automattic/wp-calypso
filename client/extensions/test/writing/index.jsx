/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';
import Banner from 'components/banner';
import FoldableCard from 'components/foldable-card';
import QueryData from '../data/queryData';
import { getData } from '../state/selector';
import FormToggle from 'components/forms/form-toggle';

class JetpackWriting extends Component {
	render() {
		return (
			<Main className="writing jetpack-ui__writing">
				<Card>
					Bias Language <FormToggle checked={ this.props.data[ 'Bias Language' ] } />
				</Card>
				<Card>
					Passive voice <FormToggle checked={ this.props.data[ 'Passive voice' ] } />
				</Card>
				<Card>
					Phrases to Avoid <FormToggle checked={ this.props.data[ 'Phrases to Avoid' ] } />
				</Card>
				<Card>
					<textarea value={ JSON.stringify( this.props.data ) } />
				</Card>
				<Card>
					<h1>Writing</h1>
					<p>Settings, or something, would go here.</p>
					<Button onClick={ this.props.loadPage( '/test/discussion' ) }>Discussion</Button>
				</Card>

				<Banner title="WFT" description={ 'WTF!! A banner that works both in calypso and wp-admin?!?!?' } />
				<FoldableCard header={ 'A foldable card, also?' }>WOW!</FoldableCard>
				<QueryData siteId={ 107582292 }/>

			</Main>
		);
	}
}


export default connect(
	( state, {} ) => {
		return {
			data: getData( state, 107582292 )
		};
	},
)( JetpackWriting );
