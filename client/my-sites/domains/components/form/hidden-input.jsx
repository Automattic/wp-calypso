/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Input from './input';

export class HiddenInput extends PureComponent {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			wasClicked: false,
			toggled: ! isEmpty( props.value ),
		};
		this.inputField = null;
	}

	static getDerivedStateFromProps( props, state ) {
		if ( props.toggled !== undefined && state.toggled !== props.toggled ) {
			return { ...state, toggled: props.toggled };
		}

		return null;
	}

	handleClick = ( event ) => {
		event.preventDefault();

		this.setState(
			{
				toggled: true,
				wasClicked: true,
			},
			() => {
				this.inputField && this.inputField.focus();
			}
		);
	};

	assignInputFieldRef = ( input ) => {
		this.inputField = input;
		if ( this.props.inputRef ) {
			this.props.inputRef( input );
		}
	};

	render() {
		if ( this.state.toggled || this.state.wasClicked ) {
			return <Input ref={ this.assignInputFieldRef } { ...this.props } />;
		}

		return (
			<div className="form__hidden-input">
				<a href="" onClick={ this.handleClick }>
					{ this.props.text }
				</a>
			</div>
		);
	}
}

export default HiddenInput;
