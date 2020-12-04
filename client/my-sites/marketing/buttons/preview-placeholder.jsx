/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import ButtonsPreviewAction from './preview-action';

class SharingButtonsPreviewPlaceholder extends React.Component {
	static displayName = 'SharingButtonsPreviewPlaceholder';

	render() {
		return (
			<div className="sharing-buttons-preview is-placeholder">
				<ButtonsPreviewAction icon="pencil" position="top-left" disabled>
					{ this.props.translate( 'Edit label text', {
						context: 'Sharing: Buttons edit label',
					} ) }
				</ButtonsPreviewAction>

				<h2 className="sharing-buttons-preview__heading">{ this.props.translate( 'Preview' ) }</h2>
				<div className="sharing-buttons-preview__display">
					<span className="sharing-buttons-preview__label" />
					<div className="sharing-buttons-preview__buttons" />

					<div className="sharing-buttons-preview__reblog-like">
						<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__like">
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							{ /* 16 is used in the preview to match the buttons on the frontend of the website. */ }
							<Gridicon icon="star" size={ 16 } />
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							{ this.props.translate( 'Like' ) }
						</a>
						<div className="sharing-buttons-preview__fake-user">
							<img src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60" />
						</div>
						<div className="sharing-buttons-preview__fake-like">
							{ this.props.translate( 'One blogger likes this' ) }
						</div>
					</div>
				</div>

				<div className="sharing-buttons-preview__button-tray-actions">
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled>
						{ this.props.translate( 'Edit visible buttons', {
							context: 'Sharing: Buttons edit label',
						} ) }
					</ButtonsPreviewAction>
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled>
						{ this.props.translate( 'Edit “More” buttons', {
							context: 'Sharing: Buttons edit label',
						} ) }
					</ButtonsPreviewAction>
				</div>
			</div>
		);
	}
}

export default localize( SharingButtonsPreviewPlaceholder );
