/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { noop, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';

class FormClickToEditInput extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		value: PropTypes.string,
		placeholder: PropTypes.string,
		disabled: PropTypes.bool,
		updateAriaLabel: PropTypes.string,
		editAriaLabel: PropTypes.string,
	};

	static defaultProps = {
		onChange: noop,
		placeholder: '',
		value: '',
		disabled: false,
		updateAriaLabel: '',
		editAriaLabel: '',
	};

	state = {
		isEditing: false,
		value: '',
	};

	editStart = () => {
		const { value } = this.props;
		this.setState( {
			isEditing: true,
			value,
		} );
	};

	editEnd = () => {
		const { onChange } = this.props;
		if ( this.props.value !== this.state.value ) {
			onChange( this.state.value );
		}

		this.setState( {
			isEditing: false,
			value: '',
		} );
	};

	onInputChange = ( e ) => {
		this.setState( {
			value: e.target.value,
		} );
	};

	renderInput() {
		const props = {
			...this.props,
			onChange: this.onInputChange,
			value: this.state.value,
		};
		return (
			<span className="form-click-to-edit-input__wrapper editing">
				<FormTextInput
					{ ...omit( props, [ 'updateAriaLabel', 'editAriaLabel' ] ) }
					onBlur={ this.editEnd }
					className="form-click-to-edit-input__input"
				/>
				<Button
					borderless
					onClick={ this.editEnd ? this.editEnd : undefined }
					aria-label={ this.props.updateAriaLabel }
				>
					<Gridicon icon="checkmark" />
				</Button>
			</span>
		);
	}

	renderText() {
		const { value, placeholder, disabled, editAriaLabel } = this.props;
		const classes = classNames( 'form-click-to-edit-input__wrapper', {
			'is-empty': ! value,
			'has-value': value,
		} );
		// Accessible labeled button provided. Clickable text is optional and not the only way to activate edit.
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		return (
			<span className={ classes }>
				<span
					className="form-click-to-edit-input__text"
					onClick={ ! disabled && this.editStart ? this.editStart : undefined }
				>
					{ value || placeholder }
				</span>

				{ ! disabled && (
					<Button borderless onClick={ this.editStart } aria-label={ editAriaLabel }>
						<Gridicon icon="pencil" />
					</Button>
				) }
			</span>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
	}

	render() {
		const { isEditing } = this.state;

		if ( isEditing ) {
			return this.renderInput();
		}

		return this.renderText();
	}
}

export default FormClickToEditInput;
