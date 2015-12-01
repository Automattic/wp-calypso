/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	PureRenderMixin = React.addons.PureRenderMixin;

/**
 * Internal dependencies
 */
var translator = require( 'lib/translator-jumpstart' ),
	localStorageHelper = require( 'store' ),
	Dialog = require( 'components/dialog' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'TranslatorLauncher',

	propTypes: {
		isActive: React.PropTypes.bool.isRequired,
		isEnabled: React.PropTypes.bool.isRequired
	},

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			infoDialogVisible: false,
			firstActivation: true
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.isActive && nextProps.isActive ) {
			// Activating
			if ( ! localStorageHelper.get( 'translator_hide_infodialog' ) ) {
				this.setState( { infoDialogVisible: true } );
			}

			if ( this.state.firstActivation ) {
				analytics.mc.bumpStat( 'calypso_translator_toggle', 'intial_activation' );
				this.setState( { firstActivation: false } );
			}
		}
	},

	toggleInfoCheckbox: function( event ) {
		localStorageHelper.set( 'translator_hide_infodialog', event.target.checked );
	},

	infoDialogClose: function() {
		this.setState( { infoDialogVisible: false } );
	},

	toggle: function( event ) {
		event.preventDefault();
		analytics.mc.bumpStat( 'calypso_translator_toggle', this.props.isActive ? 'off' : 'on' );
		translator.toggle();
	},

	render: function() {
		var launcherClasses = 'translator',
			toggleString,
			infoDialogButtons;

		if ( ! this.props.isEnabled ) {
			return null;
		}

		if ( this.props.isActive ) {
			toggleString = this.translate( 'Disable Translator' );
			launcherClasses += ' active';
		} else {
			toggleString = this.translate( 'Enable Translator' );
		}

		infoDialogButtons = [ { action: 'cancel', label: this.translate( 'Ok' ) }, ];

		return (
			<div>
				<Dialog isVisible={ this.state.infoDialogVisible } buttons={ infoDialogButtons } onClose={ this.infoDialogClose } additionalClassNames="translator-modal">
					<h1>{ this.translate( 'Community Translator' ) }</h1>
					<p>{ this.translate( 'You have now enabled the translator.  Right click highlighted text to translate it.' ) }</p>
					<p>
						<label><input type="checkbox" onClick={ this.toggleInfoCheckbox } /><span>{ this.translate( "Don't show again" ) }</span></label>
					</p>
				</Dialog>
				<div id='translator-launcher' className={ launcherClasses }>
					<a onClick={ this.toggle } href='' title={ this.translate( 'Community Translator' ) }>
						<span className="noticon noticon-website"></span>
						<div className="text">{ toggleString }</div>
					</a>
				</div>
			</div>
		);
	}
} );
