import React from 'react';
import { connect } from 'react-redux';
import { random } from 'random-unicode-emoji';

import Button from 'components/button';
import { setName } from 'plugins/hello-world/state/actions';

class HelloWorld extends React.Component {
	setRandomEmoji = () => {
		const emoji = random( { count: 1 } );
		this.props.setName( emoji );
	}

	render() {
		return (
			<div>
				<h1>{ `Hello, World ${ this.props.name }!` }</h1>
				<Button onClick={ this.setRandomEmoji }>WUT</Button>
			</div>
		);
	}
}
export default connect(
	( state ) => {
		return {
			name: state[ 'hello-world' ].name,
		};
	},
	{
		setName,
	}
)( HelloWorld );
