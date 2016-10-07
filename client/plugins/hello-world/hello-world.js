/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { random } from 'random-unicode-emoji';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SingleDocComponent from 'devdocs/doc';
import { setName } from 'plugins/hello-world/state/actions';
import { getCurrentUser } from 'state/current-user/selectors';

const noLateralPadding = {
	paddingLeft: 0,
	paddingRight: 0,
};

class HelloWorld extends React.Component {
	setRandomEmoji = () => {
		const emoji = random( { count: 1 } );
		this.props.setName( emoji );
	}

	render() {
		const { emoji, display_name = 'World' } = this.props;
		return (
			<div>
				<h1 style={ { fontSize: '2em' } }>
					{ `Hello, ${ display_name }! ${ emoji }` }
				</h1>
				<Button onClick={ this.setRandomEmoji }>WUT</Button>
				<SingleDocComponent
					path="client/plugins"
					style={ noLateralPadding } />
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		emoji: state[ 'hello-world' ].name,
		display_name: getCurrentUser( state ).display_name,
	} ),
	{ setName }
)( HelloWorld );
