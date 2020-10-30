/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';

/**
 * Style dependencies
 */
import './style.scss';

export default class FormToggle extends PureComponent {
	static propTypes = {
		onChange: PropTypes.func,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		id: PropTypes.string,
		wrapperClassName: PropTypes.string,
		'aria-label': PropTypes.string,
	};

	static defaultProps = {
		checked: false,
		disabled: false,
		onChange: noop,
	};

	static idNum = 0;

	UNSAFE_componentWillMount() {
		this.id = this.constructor.idNum++;
	}

	onKeyDown = ( event ) => {
		if ( this.props.disabled ) {
			return;
		}

		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			this.props.onChange( ! this.props.checked );
		}
	};

	onClick = ( event ) => {
		if ( event ) {
			event.stopPropagation && event.stopPropagation();
		}

		if ( ! this.props.disabled ) {
			this.props.onChange( ! this.props.checked );
		}
	};

	onLabelClick = ( event ) => {
		if ( this.props.disabled ) {
			return;
		}

		const nodeName = event.target.nodeName.toLowerCase();
		if ( nodeName !== 'a' && nodeName !== 'input' && nodeName !== 'select' ) {
			event.preventDefault();
			this.props.onChange( ! this.props.checked );
		}
	};

	render() {
		const id = this.props.id || 'toggle-' + this.id;
		const wrapperClasses = classNames( 'form-toggle__wrapper', {
			'is-disabled': this.props.disabled,
		} );

		return (
			<span className={ wrapperClasses }>
				<FormInputCheckbox
					id={ id }
					className="form-toggle"
					checked={ this.props.checked }
					readOnly={ true }
					disabled={ this.props.disabled }
				/>
				<FormLabel className="form-toggle__label" htmlFor={ id }>
					<span
						className="form-toggle__switch"
						onClick={ this.onClick }
						onKeyDown={ this.onKeyDown }
						role="checkbox"
						aria-checked={ this.props.checked }
						aria-label={ this.props[ 'aria-label' ] }
						tabIndex={ this.props.disabled ? -1 : 0 }
					/>
					{ this.props.children && (
						/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
						<span className="form-toggle__label-content" onClick={ this.onLabelClick }>
							{ this.props.children }
						</span>
						/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
					) }
				</FormLabel>
			</span>
		);
	}
}
