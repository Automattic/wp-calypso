/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ButtonsPreviewAction = require( './preview-action' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsPreviewPlaceholder',

	render: function() {
		return (
			<div className="sharing-buttons-preview is-placeholder">
				<ButtonsPreviewAction icon="pencil" position="top-left" disabled={ true }>
					{ this.translate( 'Edit label text', { context: 'Sharing: Buttons edit label' } ) }
				</ButtonsPreviewAction>

				<h2 className="sharing-buttons-preview__heading">{ this.translate( 'Preview' ) }</h2>
				<div className="sharing-buttons-preview__display">
					<span className="sharing-buttons-preview__label" />
					<div className="sharing-buttons-preview__buttons" />

					<div className="sharing-buttons-preview__reblog-like">
						<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__reblog">
							<span className="noticon noticon-reblog" />{ this.translate( 'Reblog' ) }
						</a>
						<a className="sharing-buttons-preview-button is-enabled style-icon-text sharing-buttons-preview__like">
							<span className="noticon noticon-like" />{ this.translate( 'Like' ) }
						</a>
						<div className="sharing-buttons-preview__fake-user">
							<img src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60" />
						</div>
						<div className="sharing-buttons-preview__fake-like">{ this.translate( 'One blogger likes this' ) }</div>
					</div>
				</div>

				<div className="sharing-buttons-preview__button-tray-actions">
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled={ true }>
						{ this.translate( 'Edit visible buttons', { context: 'Sharing: Buttons edit label' } ) }
					</ButtonsPreviewAction>
					<ButtonsPreviewAction icon="pencil" position="bottom-left" disabled={ true }>
						{ this.translate( 'Edit “More” buttons', { context: 'Sharing: Buttons edit label' } ) }
					</ButtonsPreviewAction>
				</div>
			</div>
		);
	}
} );
