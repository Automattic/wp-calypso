/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var translator = require( 'lib/translator-jumpstart' ),
	localStorageHelper = require( 'store' ),
	Dialog = require( 'components/dialog' ),
	analytics = require( 'lib/analytics' );

import Gridicon from 'components/gridicon';

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
		let launcherClasses = 'community-translator';
		let toggleString;

		if ( ! this.props.isEnabled ) {
			return null;
		}

		if ( this.props.isActive ) {
			toggleString = this.translate( 'Disable Translator' );
			launcherClasses += ' is-active';
		} else {
			toggleString = this.translate( 'Enable Translator' );
		}

		const infoDialogButtons = [ { action: 'cancel', label: this.translate( 'Ok' ) }, ];

		return (
			<div>
				<Dialog isVisible={ this.state.infoDialogVisible } buttons={ infoDialogButtons } onClose={ this.infoDialogClose } additionalClassNames="community-translator__modal">
					<h1>{ this.translate( 'Community Translator' ) }</h1>
					<p>{ this.translate( 'You have now enabled the translator.  Right click highlighted text to translate it.' ) }</p>
					<p>
						<label><input type="checkbox" onClick={ this.toggleInfoCheckbox } /><span>{ this.translate( "Don't show again" ) }</span></label>
					</p>
				</Dialog>
				<div className={ launcherClasses }>
					<a className="community-translator__button" onClick={ this.toggle } title={ this.translate( 'Community Translator' ) }>
						<Gridicon icon="globe" />
						<div className="community-translator__text">{ toggleString }</div>
					</a>
				</div>
			</div>
		);
	}
} );
