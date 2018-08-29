/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import i18n, { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import translator from 'lib/translator-jumpstart';
import localStorageHelper from 'store';
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';
import userSettings from 'lib/user-settings';

class TranslatorLauncher extends React.PureComponent {
	static displayName = 'TranslatorLauncher';

	static propTypes = {
		translate: PropTypes.func,
	};

	state = {
		infoDialogVisible: false,
		firstActivation: true,
		isActive: translator.isActivated(),
		isEnabled: translator.isEnabled(),
	};

	componentDidMount() {
		i18n.on( 'change', this.onI18nChange );
		userSettings.on( 'change', this.onUserSettingsChange );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.onI18nChange );
		userSettings.off( 'change', this.onUserSettingsChange );
	}

	onI18nChange = () => {
		if ( ! this.state.isActive && translator.isActivated() ) {
			// Activating
			this.setState( { isActive: true } );

			if ( ! localStorageHelper.get( 'translator_hide_infodialog' ) ) {
				this.setState( { infoDialogVisible: true } );
			}

			if ( this.state.firstActivation ) {
				analytics.mc.bumpStat( 'calypso_translator_toggle', 'intial_activation' );
				this.setState( { firstActivation: false } );
			}
		} else if ( this.state.isActive && ! translator.isActivated() ) {
			// Deactivating
			this.setState( { isActive: false } );
		}
	};

	onUserSettingsChange = () => {
		if ( this.state.isEnabled !== translator.isEnabled() ) {
			this.setState( { isEnabled: translator.isEnabled() } );
		}
	};

	toggleInfoCheckbox = event => {
		localStorageHelper.set( 'translator_hide_infodialog', event.target.checked );
	};

	infoDialogClose = () => {
		this.setState( { infoDialogVisible: false } );
	};

	toggle = event => {
		event.preventDefault();
		const nextIsActive = translator.toggle();
		analytics.mc.bumpStat( 'calypso_translator_toggle', nextIsActive ? 'on' : 'off' );
		this.setState( { isActive: nextIsActive } );
	};

	render() {
		let launcherClasses = 'community-translator';
		let toggleString;

		if ( ! this.state.isEnabled ) {
			return null;
		}

		if ( this.state.isActive ) {
			toggleString = this.props.translate( 'Disable Translator' );
			launcherClasses += ' is-active';
		} else {
			toggleString = this.props.translate( 'Enable Translator' );
		}

		const infoDialogButtons = [ { action: 'cancel', label: this.props.translate( 'Ok' ) } ];

		return (
			<div className="community-translator__container">
				<Dialog
					isVisible={ this.state.infoDialogVisible }
					buttons={ infoDialogButtons }
					onClose={ this.infoDialogClose }
					additionalClassNames="community-translator__modal"
				>
					<h1>{ this.props.translate( 'Community Translator' ) }</h1>
					<p>
						{ this.props.translate(
							'You have now enabled the translator. Right click the text to translate it.'
						) }
					</p>
					<p>
						<label>
							<input type="checkbox" onClick={ this.toggleInfoCheckbox } />
							<span>{ this.props.translate( "Don't show again" ) }</span>
						</label>
					</p>
				</Dialog>
				<div className={ launcherClasses }>
					<a
						className="community-translator__button"
						onClick={ this.toggle }
						title={ this.props.translate( 'Community Translator' ) }
					>
						<Gridicon icon="globe" />
						<div className="community-translator__text">{ toggleString }</div>
					</a>
				</div>
			</div>
		);
	}
}

export default localize( TranslatorLauncher );
