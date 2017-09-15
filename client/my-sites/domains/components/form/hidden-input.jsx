/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Input from './input';

export default class extends React.Component {
	static displayName = 'HiddenInput';

	state = {
		toggled: false
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.toggled && ! isEmpty( nextProps.value ) ) {
			this.setState( { toggled: true } );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		// Focus the input only when the user explicitly clicked the toggle link
		if ( ! prevState.toggled && this.state.toggled && prevProps.value === this.props.value ) {
			this.refs.input.focus();
		}
	}

	handleClick = event => {
		event.preventDefault();

		this.setState( {
			toggled: true
		} );
	};

	render() {
		if ( this.state.toggled ) {
			return (
				<Input ref="input" { ...this.props } />
			);
		}

		return (
			<div className="hidden-input">
				<a href="" onClick={ this.handleClick }>{ this.props.text }</a>
			</div>
		);
	}
}
