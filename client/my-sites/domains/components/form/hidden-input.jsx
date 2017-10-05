/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Input from './input';

class HiddenInput extends Component {

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

	handleClick = ( event ) => {
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

export default localize( HiddenInput );
