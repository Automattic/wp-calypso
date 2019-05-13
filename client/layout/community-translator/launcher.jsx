/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import i18n, { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import translator, { trackTranslatorStatus } from 'lib/translator-jumpstart';
import localStorageHelper from 'store';
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';
import { i18nScanner } from 'lib/i18n-utils/utils';
import getUserSettings from 'state/selectors/get-user-settings';
import getOriginalUserSetting from 'state/selectors/get-original-user-setting';
import QueryUserSettings from 'components/data/query-user-settings';

class TranslatorLauncher extends React.PureComponent {
	static displayName = 'TranslatorLauncher';

	static propTypes = {
		translate: PropTypes.func,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		translator.init( nextProps.isUserSettingsReady );
		trackTranslatorStatus( nextProps.isTranslatorEnabled );

		if ( prevState.isEnabled !== translator.isEnabled() )
			return { ...prevState, isEnabled: translator.isEnabled() };

		return null;
	}

	state = {
		infoDialogVisible: false,
		firstActivation: true,
		isActive: translator.isActivated(),
		isEnabled: translator.isEnabled(),
		isScanning: false,
		showScannedTranslations: false,
	};

	componentDidMount() {
		i18n.on( 'change', this.onI18nChange );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.onI18nChange );
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

	toggleInfoCheckbox = event => {
		localStorageHelper.set( 'translator_hide_infodialog', event.target.checked );
	};

	infoDialogClose = () => {
		this.setState( { infoDialogVisible: false, showScannedTranslations: false } );
		i18nScanner.clear();
	};

	toggle = event => {
		event.preventDefault();
		const nextIsActive = translator.toggle();
		analytics.mc.bumpStat( 'calypso_translator_toggle', nextIsActive ? 'on' : 'off' );
		this.setState( { isActive: nextIsActive } );
	};

	toggleScan = event => {
		event.preventDefault();
		// const nextIsActive = translator.toggle();
		if ( ! this.state.isScanning ) {
			// analytics.mc.bumpStat( 'calypso_translator_scan_translations' );
			i18nScanner.start();
			this.setState( { isScanning: true, showScannedTranslations: false } );
		} else {
			i18nScanner.stop();
			this.setState( { isScanning: false, showScannedTranslations: true } );
		}
	};

	renderCommunityTranslatorModal = () => {
		const infoDialogButtons = [ { action: 'cancel', label: this.props.translate( 'Ok' ) } ];

		return (
			<Dialog
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
					<label htmlFor="toggle">
						<input type="checkbox" id="toggle" onClick={ this.toggleInfoCheckbox } />
						<span>{ this.props.translate( "Don't show again" ) }</span>
					</label>
				</p>
			</Dialog>
		);
	};

	renderTranslationScannerModal = () => {
		const infoDialogButtons = [ { action: 'cancel', label: this.props.translate( 'Ok' ) } ];

		return (
			<Dialog
				isVisible={ true }
				buttons={ infoDialogButtons }
				onClose={ this.infoDialogClose }
				additionalClassNames="community-translator__modal"
			>
				<h1>{ this.props.translate( 'Scanned Translations' ) }</h1>
				{ i18nScanner.loggedTranslations.map( this.renderTranslation ) }
			</Dialog>
		);
	};

	renderTranslation( [ translation, options ] ) {
		return (
			<div
				className="community-translator__scanned-translation"
				key={ options.original + options.context }
			>
				{ translation.original || translation }
				{ ': ' }
				{ options.original }
				{ options.singular && `, singular: ${ options.singular }` }
				{ options.context && ` (context: ${ options.context })` }
			</div>
		);
	}

	render() {
		const { translate } = this.props;
		const {
			isActive: translatorActive,
			isEnabled,
			isScanning,
			infoDialogVisible,
			showScannedTranslations,
		} = this.state;
		const translatorToggleString = translatorActive
			? translate( 'Disable Translator' )
			: translate( 'Enable Translator' );

		return (
			<div>
				<QueryUserSettings />
				{ isEnabled && infoDialogVisible && this.renderCommunityTranslatorModal() }
				{ isEnabled && showScannedTranslations && this.renderTranslationScannerModal() }
				{ isEnabled && (
					<div className="community-translator">
						<button
							className={ classNames( {
								'community-translator__button': true,
								'is-active': translatorActive,
							} ) }
							onClick={ this.toggle }
							title={ translate( 'Community Translator' ) }
						>
							<Gridicon icon="globe" />
							<div className="community-translator__text">{ translatorToggleString }</div>
						</button>
						<button
							className={ classNames( {
								'community-translator__button': true,
								'is-active': isScanning,
							} ) }
							onClick={ this.toggleScan }
							title={ translate( 'Translation Scanner' ) }
						>
							<Gridicon icon="globe" />
							{ isScanning ? <Gridicon icon="pause" /> : <Gridicon icon="video-camera" /> }
						</button>
					</div>
				) }
			</div>
		);
	}
}

export default connect( state => ( {
	isUserSettingsReady: !! getUserSettings( state ),
	isTranslatorEnabled: getOriginalUserSetting( state, 'enable_translator' ),
} ) )( localize( TranslatorLauncher ) );
