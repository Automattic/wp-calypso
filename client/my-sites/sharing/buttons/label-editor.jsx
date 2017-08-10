/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var decodeEntities = require( 'lib/formatting' ).decodeEntities;

var SharingButtonsLabelEditor = module.exports = localize(class extends React.Component {
    static displayName = 'SharingButtonsLabelEditor';

	static propTypes = {
		active: React.PropTypes.bool,
		value: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onClose: React.PropTypes.func,
		hasEnabledButtons: React.PropTypes.bool
	};

	static closeKeyCodes = [
		13, // Return
		27  // Escape
	];

	static defaultProps = {
		active: false,
		value: '',
		onChange: function() {},
		onClose: function() {},
		hasEnabledButtons: true
	};

	onKeyDown = event => {
		if ( -1 !== SharingButtonsLabelEditor.closeKeyCodes.indexOf( event.keyCode ) ) {
			event.target.blur();
			event.preventDefault();
			this.props.onClose();
		}
	};

	onInputChange = event => {
		this.props.onChange( event.target.value );
	};

	getNoButtonsNoticeElement = () => {
		if ( ! this.props.hasEnabledButtons ) {
			return (
			    <em className="sharing-buttons-preview__panel-notice">
					{ this.props.translate( 'This text won\'t appear until you add at least one sharing button.', {
						context: 'Sharing: Buttons'
					} ) }
				</em>
			);
		}
	};

	render() {
		var classes = classNames( 'sharing-buttons-preview__panel', 'is-top', 'sharing-buttons-label-editor', {
			'is-active': this.props.active
		} );

		return (
		    <div className={ classes }>
				<div className="sharing-buttons-preview__panel-content">
					<h3 className="sharing-buttons-preview__panel-heading">
						{ this.props.translate( 'Edit label text', { context: 'Sharing: buttons' } ) }
					</h3>
					<p className="sharing-buttons-preview__panel-instructions">
						{ this.props.translate( 'Change the text of the sharing buttons label' ) }
					</p>
					<input type="text" value={ decodeEntities( this.props.value ) } onKeyDown={ this.onKeyDown } onChange={ this.onInputChange } className="sharing-buttons-label-editor__input" />
					{ this.getNoButtonsNoticeElement() }
				</div>
				<footer className="sharing-buttons-preview__panel-actions">
					<button type="button" className="button" onClick={ this.props.onClose }>{ this.props.translate( 'Close' ) }</button>
				</footer>
			</div>
		);
	}
});
