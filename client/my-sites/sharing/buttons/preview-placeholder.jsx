/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ButtonsPreviewAction from './preview-action';

export default localize( React.createClass( {
	displayName: 'SharingButtonsPreviewPlaceholder',

	render: function() {
		return (
		    <div className="sharing-buttons-preview is-placeholder">
				<ButtonsPreviewAction icon="pencil" position="top-left" disabled={ true }>
					{ this.props.translate( 'Edit label text', { context: 'Sharing: Buttons edit label' } ) }
				</ButtonsPreviewAction>

				<h2 className="sharing-buttons-preview__heading">{ this.props.translate( 'Preview' ) }</h2>
				<div className="sharing-buttons-preview__display">
					<span className="sharing-buttons-preview__label" />
					<div className="sharing-buttons-preview__buttons" />

					<div className="sharing-buttons-preview__reblog-like">
						<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__like">
							<span className="noticon noticon-like" />{ this.props.translate( 'Like' ) }
						</a>
						<div className="sharing-buttons-preview__fake-user">
							<img src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60" />
						</div>
						<div className="sharing-buttons-preview__fake-like">{ this.props.translate( 'One blogger likes this' ) }</div>
					</div>
				</div>

				<div className="sharing-buttons-preview__button-tray-actions">
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled={ true }>
						{ this.props.translate( 'Edit visible buttons', { context: 'Sharing: Buttons edit label' } ) }
					</ButtonsPreviewAction>
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled={ true }>
						{ this.props.translate( 'Edit “More” buttons', { context: 'Sharing: Buttons edit label' } ) }
					</ButtonsPreviewAction>
				</div>
			</div>
		);
	}
} ) );
