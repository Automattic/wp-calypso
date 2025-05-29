import { Button } from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
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

	getIsValueHidden() {
		if ( this.props.hideToggle ) {
			return true;
		}

		return this.props.submitting || this.state.hidePassword;
	}

	focus = () => {
		this.textFieldRef.current.focus();
	};

	render() {
		const { hideToggle, submitting, isHidden, locale, translate, ...rest } = this.props;
		const isValueHidden = this.getIsValueHidden();

		return (
			<div className="form-password-input">
				<FormTextInput
					autoComplete="off"
					{ ...rest }
					ref={ this.textFieldRef }
					type={ isValueHidden ? 'password' : 'text' }
				/>

				<Button
					className={ clsx( {
						'form-password-input__toggle': true,
						'form-password-input__toggle-visibility': ! hideToggle,
					} ) }
					onClick={ this.togglePasswordVisibility }
					aria-hidden={ isHidden }
					tabIndex={ isHidden ? -1 : undefined }
					size="small"
					icon={ isValueHidden ? unseen : seen }
					label={ isValueHidden ? translate( 'Show password' ) : translate( 'Hide password' ) }
				/>
			</div>
		);
	}
}

export default localize( FormPasswordInput );
