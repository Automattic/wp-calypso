/** @format */

/**
 * External dependencies
 */

import React from 'react';
import GridiconVisible from 'gridicons/dist/visible';
import GridiconNotVisible from 'gridicons/dist/not-visible';
import classNames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import { isMobile } from 'lib/viewport';

export default class extends React.Component {
	static displayName = 'FormPasswordInput';

	state = {
		hidePassword: true,
	};

	componentDidMount() {
		if ( isMobile() ) {
			this.state = { hidePassword: false };
			return;
		}
		this.state = { hidePassword: true };
		return;
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
		this.refs.textField.focus();
	};

	render() {
		const toggleVisibilityClasses = classNames( {
			'form-password-input__toggle': true,
			'form-password-input__toggle-visibility': ! this.props.hideToggle,
		} );

		return (
			<div className="form-password-input">
				<FormTextInput
					{ ...omit( this.props, 'hideToggle', 'submitting' ) }
					autoComplete="off"
					ref="textField"
					type={ this.hidden() ? 'password' : 'text' }
				/>

				<span className={ toggleVisibilityClasses } onClick={ this.togglePasswordVisibility }>
					{ this.hidden() ? <GridiconNotVisible /> : <GridiconVisible /> }
				</span>
			</div>
		);
	}
}
