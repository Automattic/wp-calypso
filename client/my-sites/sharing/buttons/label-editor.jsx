var PropTypes = require('prop-types');
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var decodeEntities = require( 'lib/formatting' ).decodeEntities;

var SharingButtonsLabelEditor = module.exports = React.createClass( {
	displayName: 'SharingButtonsLabelEditor',

	propTypes: {
		active: PropTypes.bool,
		value: PropTypes.string,
		onChange: PropTypes.func,
		onClose: PropTypes.func,
		hasEnabledButtons: PropTypes.bool
	},

	statics: {
		closeKeyCodes: [
			13, // Return
			27  // Escape
		]
	},

	getDefaultProps: function() {
		return {
			active: false,
			value: '',
			onChange: function() {},
			onClose: function() {},
			hasEnabledButtons: true
		};
	},

	onKeyDown: function( event ) {
		if ( -1 !== SharingButtonsLabelEditor.closeKeyCodes.indexOf( event.keyCode ) ) {
			event.target.blur();
			event.preventDefault();
			this.props.onClose();
		}
	},

	onInputChange: function( event ) {
		this.props.onChange( event.target.value );
	},

	getNoButtonsNoticeElement: function() {
		if ( ! this.props.hasEnabledButtons ) {
			return (
				<em className="sharing-buttons-preview__panel-notice">
					{ this.translate( 'This text won\'t appear until you add at least one sharing button.', {
						context: 'Sharing: Buttons'
					} ) }
				</em>
			);
		}
	},

	render: function() {
		var classes = classNames( 'sharing-buttons-preview__panel', 'is-top', 'sharing-buttons-label-editor', {
			'is-active': this.props.active
		} );

		return (
			<div className={ classes }>
				<div className="sharing-buttons-preview__panel-content">
					<h3 className="sharing-buttons-preview__panel-heading">
						{ this.translate( 'Edit label text', { context: 'Sharing: buttons' } ) }
					</h3>
					<p className="sharing-buttons-preview__panel-instructions">
						{ this.translate( 'Change the text of the sharing buttons label' ) }
					</p>
					<input type="text" value={ decodeEntities( this.props.value ) } onKeyDown={ this.onKeyDown } onChange={ this.onInputChange } className="sharing-buttons-label-editor__input" />
					{ this.getNoButtonsNoticeElement() }
				</div>
				<footer className="sharing-buttons-preview__panel-actions">
					<button type="button" className="button" onClick={ this.props.onClose }>{ this.translate( 'Close' ) }</button>
				</footer>
			</div>
		);
	}
} );
