/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import { decodeEntities } from 'lib/formatting';

const closeKeyCodes = [
	13, // Return
	27, // Escape
];

class SharingButtonsLabelEditor extends React.Component {
	static displayName = 'SharingButtonsLabelEditor';

	static propTypes = {
		active: PropTypes.bool,
		value: PropTypes.string,
		onChange: PropTypes.func,
		onClose: PropTypes.func,
		hasEnabledButtons: PropTypes.bool,
	};

	static defaultProps = {
		active: false,
		value: '',
		onChange: function () {},
		onClose: function () {},
		hasEnabledButtons: true,
	};

	onKeyDown = ( event ) => {
		if ( -1 !== closeKeyCodes.indexOf( event.keyCode ) ) {
			event.target.blur();
			event.preventDefault();
			this.props.onClose();
		}
	};

	onInputChange = ( event ) => {
		this.props.onChange( event.target.value );
	};

	getNoButtonsNoticeElement = () => {
		if ( ! this.props.hasEnabledButtons ) {
			return (
				<em className="sharing-buttons-preview__panel-notice">
					{ this.props.translate(
						"This text won't appear until you add at least one sharing button.",
						{
							context: 'Sharing: Buttons',
						}
					) }
				</em>
			);
		}
	};

	render() {
		const classes = classNames(
			'sharing-buttons-preview__panel',
			'is-top',
			'sharing-buttons-label-editor',
			{
				'is-active': this.props.active,
			}
		);

		return (
			<div className={ classes }>
				<div className="sharing-buttons-preview__panel-content">
					<h3 className="sharing-buttons-preview__panel-heading">
						{ this.props.translate( 'Edit label text', { context: 'Sharing: buttons' } ) }
					</h3>
					<p className="sharing-buttons-preview__panel-instructions">
						{ this.props.translate( 'Change the text of the sharing buttons label' ) }
					</p>
					<FormTextInput
						value={ decodeEntities( this.props.value ) }
						onKeyDown={ this.onKeyDown }
						onChange={ this.onInputChange }
						className="sharing-buttons-label-editor__input"
					/>
					{ this.getNoButtonsNoticeElement() }
				</div>
				<footer className="sharing-buttons-preview__panel-actions">
					<button type="button" className="button" onClick={ this.props.onClose }>
						{ this.props.translate( 'Close' ) }
					</button>
				</footer>
			</div>
		);
	}
}

export default localize( SharingButtonsLabelEditor );
