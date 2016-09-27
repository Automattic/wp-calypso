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
import { setName } from 'plugins/hello-world/state/actions';
import { getCurrentUser } from 'state/current-user/selectors';


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
