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
			toggled: ! isEmpty( props.value ),
		};
		this.inputField = null;
	}

	handleClick = ( event ) => {
		event.preventDefault();

		this.setState(
			{
				toggled: true,
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
		if ( this.state.toggled ) {
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
