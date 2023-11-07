import config from '@automattic/calypso-config';
import { Dialog, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import localStorageHelper from 'store';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import { bumpStat } from 'calypso/lib/analytics/mc';
import {
	getLanguageEmpathyModeActive,
	toggleLanguageEmpathyMode,
} from 'calypso/lib/i18n-utils/empathy-mode';
import { TranslationScanner } from 'calypso/lib/i18n-utils/translation-scanner';
import translator, { trackTranslatorStatus } from 'calypso/lib/translator-jumpstart';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getOriginalUserSetting from 'calypso/state/selectors/get-original-user-setting';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import './style.scss';

class TranslatorLauncher extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static translationScanner =
		config.isEnabled( 'i18n/translation-scanner' ) && new TranslationScanner();

	static getDerivedStateFromProps( nextProps, prevState ) {
		translator.init( nextProps.currentUser, nextProps.isUserSettingsReady );
		trackTranslatorStatus( nextProps.isTranslatorEnabled );

		if ( prevState.isEnabled !== translator.isEnabled() ) {
			return { ...prevState, isEnabled: translator.isEnabled() };
		}

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
				bumpStat( 'calypso_translator_toggle', 'intial_activation' );
				this.setState( { firstActivation: false } );
			}
		} else if ( this.state.isActive && ! translator.isActivated() ) {
			// Deactivating
			this.setState( { isActive: false } );
		}
	};

	toggleInfoCheckbox = ( event ) => {
		localStorageHelper.set( 'translator_hide_infodialog', event.target.checked );
	};

	infoDialogClose = () => {
		this.setState( { infoDialogVisible: false } );
	};

	toggleEmpathyMode = () => {
		toggleLanguageEmpathyMode();
	};

	toggle = ( event ) => {
		event.preventDefault();

		const { isEmpathyModeEnabled } = this.props;

		if ( isEmpathyModeEnabled ) {
			this.toggleEmpathyMode();
			return;
		}

		const nextIsActive = translator.toggle();
		bumpStat( 'calypso_translator_toggle', nextIsActive ? 'on' : 'off' );
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
					<FormLabel htmlFor="toggle">
						<FormInputCheckbox id="toggle" onClick={ this.toggleInfoCheckbox } />
						<span>{ translate( "Don't show again" ) }</span>
					</FormLabel>
				</p>
			</Dialog>
		);
	}

	render() {
		const { translate, isEmpathyModeEnabled, selectedLanguageSlug } = this.props;
		const { isEnabled, isActive, infoDialogVisible } = this.state;

		const launcherClasses = classNames( 'community-translator', {
			'is-active': isActive,
			'is-incompatible': isEmpathyModeEnabled,
		} );
		const toggleString = isActive
			? translate( 'Disable Translator' )
			: translate( 'Enable Translator' );
		const toggleEmpathyModeString = getLanguageEmpathyModeActive()
			? 'Deactivate Empathy mode'
			: 'Activate Empathy mode';
		const buttonString = isEmpathyModeEnabled ? toggleEmpathyModeString : toggleString;
		const shouldRenderLauncherButton = isEnabled || isEmpathyModeEnabled;

		return (
			<Fragment>
				<QueryUserSettings />
				{ shouldRenderLauncherButton && (
					<Fragment>
						<div className={ launcherClasses }>
							<button
								onClick={ this.toggle }
								className="community-translator__button"
								title={ translate( 'Community Translator' ) }
							>
								<Gridicon icon="globe" />
								{ isEmpathyModeEnabled && (
									<span className="community-translator__badge">{ selectedLanguageSlug }</span>
								) }
								<div className="community-translator__text">{ buttonString }</div>
							</button>
						</div>
						{ infoDialogVisible && this.renderConfirmationModal() }
					</Fragment>
				) }
			</Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
	isUserSettingsReady: !! getUserSettings( state ),
	isTranslatorEnabled: getOriginalUserSetting( state, 'enable_translator' ),
	isEmpathyModeEnabled:
		config.isEnabled( 'i18n/empathy-mode' ) && getOriginalUserSetting( state, 'i18n_empathy_mode' ),
} ) )( localize( TranslatorLauncher ) );
