import { Icon } from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import clsx from 'clsx';
import { omit } from 'lodash';
import { createRef, Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

class FormPasswordInput extends Component {
	static displayName = 'FormPasswordInput';

	textFieldRef = createRef();

	constructor( props ) {
		super( props );
		this.state = { hidePassword: true };
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
		const toggleVisibilityClasses = clsx( {
			'form-password-input__toggle': true,
			'form-password-input__toggle-visibility': ! this.props.hideToggle,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
		return (
			<div className="form-password-input">
				<FormTextInput
					autoComplete="off"
					{ ...omit( this.props, 'hideToggle', 'submitting' ) }
					ref={ this.textFieldRef }
					type={ this.hidden() ? 'password' : 'text' }
				/>

				<span className={ toggleVisibilityClasses } onClick={ this.togglePasswordVisibility }>
					{ this.hidden() ? <Icon icon={ unseen } /> : <Icon icon={ seen } /> }
				</span>
			</div>
		);
	}
}

export default FormPasswordInput;
