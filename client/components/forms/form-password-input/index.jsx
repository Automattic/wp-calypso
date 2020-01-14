/**
 * External dependencies
 */

import React from 'react';
import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import { isMobile } from 'lib/viewport';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'FormPasswordInput';

	state = {
		hidePassword: true,
	};

	textFieldRef = React.createRef();

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
					{ ...omit( this.props, 'hideToggle', 'submitting' ) }
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
