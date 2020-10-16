/**
 * External dependencies
 */
import { omit } from 'lodash';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';

/**
 * Style dependencies
 */
import './style.scss';

class FormPasswordInput extends React.Component {
	static displayName = 'FormPasswordInput';

	textFieldRef = React.createRef();

	constructor( props ) {
		super( props );
		this.state = { hidePassword: ! props.isBreakpointActive };
	}

	togglePasswordVisibility = () => {
		this.setState( { hidePassword: ! this.state.hidePassword } );
	};

	hidden() {
		if ( this.props.hideToggle ) {
			return true;
		}
		return this.props.submitting || this.state.hidePassword;
	}

	focus = () => {
		this.textFieldRef.current.focus();
	};

	render() {
		const toggleVisibilityClasses = classNames( {
			'form-password-input__toggle': true,
			'form-password-input__toggle-visibility': ! this.props.hideToggle,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
		return (
			<div className="form-password-input">
				<FormTextInput
					{ ...omit( this.props, 'hideToggle', 'submitting', 'isBreakpointActive' ) }
					autoComplete="off"
					ref={ this.textFieldRef }
					type={ this.hidden() ? 'password' : 'text' }
				/>

				<span className={ toggleVisibilityClasses } onClick={ this.togglePasswordVisibility }>
					{ this.hidden() ? <Gridicon icon="not-visible" /> : <Gridicon icon="visible" /> }
				</span>
			</div>
		);
	}
}

export default withMobileBreakpoint( FormPasswordInput );
