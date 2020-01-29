/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import i18n, { localize } from 'i18n-calypso';
import React, { Fragment } from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import translator, { trackTranslatorStatus } from 'lib/translator-jumpstart';
import localStorageHelper from 'store';
import { Dialog } from '@automattic/components';
import analytics from 'lib/analytics';
import { TranslationScanner } from 'lib/i18n-utils/translation-scanner';
import getUserSettings from 'state/selectors/get-user-settings';
import getOriginalUserSetting from 'state/selectors/get-original-user-setting';
import QueryUserSettings from 'components/data/query-user-settings';

/**
 * Style dependencies
 */
import './style.scss';

class TranslatorLauncher extends React.Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static translationScanner =
		config.isEnabled( 'i18n/translation-scanner' ) && new TranslationScanner();

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
		this.setState( { infoDialogVisible: false } );
	};

	toggle = event => {
		event.preventDefault();
		const nextIsActive = translator.toggle();
		analytics.mc.bumpStat( 'calypso_translator_toggle', nextIsActive ? 'on' : 'off' );
		this.setState( { isActive: nextIsActive } );
	};

	renderConfirmationModal() {
		const { translate } = this.props;
		const infoDialogButtons = [ { action: 'cancel', label: translate( 'OK' ) } ];

		return (
			<Dialog
				isVisible
				buttons={ infoDialogButtons }
				onClose={ this.infoDialogClose }
				additionalClassNames="community-translator__modal"
			>
				<h1>{ translate( 'Community Translator' ) }</h1>
				<p>
					{ translate(
						'You have now enabled the translator. Right click the text to translate it.'
					) }
				</p>
				<p>
					<label htmlFor="toggle">
						<input type="checkbox" id="toggle" onClick={ this.toggleInfoCheckbox } />
						<span>{ translate( "Don't show again" ) }</span>
					</label>
				</p>
			</Dialog>
		);
	}

	render() {
		const { translate } = this.props;
		const { isEnabled, isActive, infoDialogVisible } = this.state;

		const launcherClasses = classNames( 'community-translator', { 'is-active': isActive } );
		const toggleString = isActive
			? translate( 'Disable Translator' )
			: translate( 'Enable Translator' );

		return (
			<Fragment>
				<QueryUserSettings />
				{ isEnabled && (
					<Fragment>
						<div className={ launcherClasses }>
							<button
								className="community-translator__button"
								onClick={ this.toggle }
								title={ translate( 'Community Translator' ) }
							>
								<Gridicon icon="globe" />
								<div className="community-translator__text">{ toggleString }</div>
							</button>
						</div>
						{ infoDialogVisible && this.renderConfirmationModal() }
					</Fragment>
				) }
			</Fragment>
		);
	}
}

export default connect( state => ( {
	isUserSettingsReady: !! getUserSettings( state ),
	isTranslatorEnabled: getOriginalUserSetting( state, 'enable_translator' ),
} ) )( localize( TranslatorLauncher ) );
