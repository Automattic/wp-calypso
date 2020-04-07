/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import i18n, { localize } from 'i18n-calypso';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import config from 'config';
import translator, { trackTranslatorStatus } from 'lib/translator-jumpstart';
import localStorageHelper from 'store';
import { Button, Dialog } from '@automattic/components';
import { bumpStat } from 'lib/analytics/mc';
import { TranslationScanner } from 'lib/i18n-utils/translation-scanner';
import getUserSettings from 'state/selectors/get-user-settings';
import getOriginalUserSetting from 'state/selectors/get-original-user-setting';
import { setLocale } from 'state/ui/language/actions';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import QueryUserSettings from 'components/data/query-user-settings';
import FormTextInput from 'components/forms/form-text-input';

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
		isDeliverableHighlightEnabled: false,
		deliverableTarget: null,
		selectedDeliverableTarget: null,
		deliverableTitle: '',
		scrollTop: 0,
	};

	highlightRef = React.createRef();

	componentDidMount() {
		i18n.on( 'change', this.onI18nChange );
		window.addEventListener( 'keydown', this.handleKeyDown );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.onI18nChange );
		window.removeEventListener( 'keydown', this.handleKeyDown );
	}

	getOriginalIds = () => {
		const { selectedDeliverableTarget } = this.state;

		return [ selectedDeliverableTarget ]
			.concat(
				Array.from( selectedDeliverableTarget.querySelectorAll( '[class*=translator-original-]' ) )
			)
			.reduce( ( ids, node ) => {
				const [ , originalId ] =
					( node.className && node.className.match( /translator-original-(\d+)/ ) ) || [];

				if ( originalId && ids.indexOf( originalId ) === -1 ) {
					ids.push( originalId );
				}

				return ids;
			}, [] );
	};

	getCreateDeliverableUrl = () => {
		const DELIVERABLES_ENDPOINT = 'https://translate.wordpress.com/deliverables/create';
		const { deliverableTitle } = this.state;

		return addQueryArgs( DELIVERABLES_ENDPOINT, {
			original_ids: this.getOriginalIds().join( ',' ),
			title: deliverableTitle,
		} );
	};

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

	handleKeyDown = event => {
		const { isActive, selectedDeliverableTarget } = this.state;

		if ( ! isActive || ! event.getModifierState( 'Control' ) || event.key.toLowerCase() !== 'd' ) {
			return;
		}

		if ( selectedDeliverableTarget ) {
			this.toggleSelectedDeliverableTarget();
		}

		this.toggleDeliverableHighlight();
	};

	handleWindowScroll = () => {
		this.setState( { scrollTop: window.scrollY } );
	};

	handleHighlightMouseMove = event => {
		const { deliverableTarget } = this.state;

		if ( deliverableTarget !== event.target ) {
			this.setState( { deliverableTarget: event.target } );
		}
	};

	handleHighlightMouseDown = event => {
		event.preventDefault();
		event.stopPropagation();

		if ( this.highlightRef.current ) {
			this.highlightRef.current.style.pointerEvents = 'all';
		}
	};

	handleHighlightClick = event => {
		event.preventDefault();
		event.stopPropagation();

		if ( this.highlightRef.current ) {
			this.highlightRef.current.style.pointerEvents = '';
		}

		this.toggleSelectedDeliverableTarget();
		this.toggleDeliverableHighlight();
	};

	handleDeliverableTitleChange = event => {
		this.setState( { deliverableTitle: event.target.value } );
	};

	handleDeliverableLinkClick = () => {
		this.toggleSelectedDeliverableTarget();
	};

	handleDeliverableCancelClick = () => {
		this.toggleSelectedDeliverableTarget();
	};

	handleDeliverableSubmit = event => {
		event.preventDefault();

		window.open( this.getCreateDeliverableUrl(), '_blank' );
		this.toggleSelectedDeliverableTarget();
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
		bumpStat( 'calypso_translator_toggle', nextIsActive ? 'on' : 'off' );
		this.setState( { isActive: nextIsActive } );
	};

	toggleDeliverableHighlight = () => {
		const isDeliverableHighlightEnabled = ! this.state.isDeliverableHighlightEnabled;

		this.setState( { isDeliverableHighlightEnabled, deliverableTarget: null } );

		if ( isDeliverableHighlightEnabled ) {
			window.addEventListener( 'scroll', this.handleWindowScroll );
			window.addEventListener( 'mousemove', this.handleHighlightMouseMove );
			window.addEventListener( 'mousedown', this.handleHighlightMouseDown );
			window.addEventListener( 'click', this.handleHighlightClick );
		} else {
			window.removeEventListener( 'mousemove', this.handleHighlightMouseMove );
			window.removeEventListener( 'mousedown', this.handleHighlightMouseDown );
			window.removeEventListener( 'click', this.handleHighlightClick );
		}
	};

	toggleSelectedDeliverableTarget = () => {
		this.setState(
			( { deliverableTarget, selectedDeliverableTarget } ) => ( {
				selectedDeliverableTarget: selectedDeliverableTarget ? null : deliverableTarget,
				deliverableTitle: '',
			} ),
			() => {
				const hasSelectedDeliverableTarget = !! this.state.selectedDeliverableTarget;

				document.body.classList.toggle(
					'has-deliverable-highlighted',
					hasSelectedDeliverableTarget
				);

				if ( hasSelectedDeliverableTarget ) {
					window.addEventListener( 'scroll', this.handleWindowScroll );

					this.selectedLanguageSlug = this.props.selectedLanguageSlug;

					const DEFAULT_LANGUAGE = 'en';
					setLocale( DEFAULT_LANGUAGE );
				} else {
					window.removeEventListener( 'scroll', this.handleWindowScroll );

					this.selectedLanguageSlug && this.props.setLocale( this.selectedLanguageSlug );
				}
			}
		);
	};

	renderDeliverableForm() {
		const { selectedDeliverableTarget, deliverableTitle } = this.state;
		const { translate } = this.props;

		if ( ! selectedDeliverableTarget ) {
			return;
		}

		const stringIdsCount = this.getOriginalIds().length;

		return (
			<div className="masterbar community-translator__bar">
				<form className="community-translator__bar-form" onSubmit={ this.handleDeliverableSubmit }>
					<div className="community-translator__bar-label">
						{ translate( '%d string found.', '%d strings found.', {
							count: stringIdsCount,
							args: [ stringIdsCount ],
						} ) }{ ' ' }
						{ translate( 'Enter a title:' ) }
					</div>

					<FormTextInput
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						value={ deliverableTitle }
						onChange={ this.handleDeliverableTitleChange }
					/>

					<Button
						href={ this.getCreateDeliverableUrl() }
						target="_blank"
						onClick={ this.handleDeliverableLinkClick }
						primary
					>
						{ translate( 'Create Deliverable' ) }
					</Button>
					<Button onClick={ this.handleDeliverableCancelClick }>{ translate( 'Cancel' ) }</Button>
				</form>
			</div>
		);
	}

	renderDeliverableHighlight() {
		const { deliverableTarget, selectedDeliverableTarget, scrollTop } = this.state;
		const target = deliverableTarget || selectedDeliverableTarget;

		if ( ! target ) {
			return null;
		}

		const { left, top, width, height } = target.getBoundingClientRect();
		const style = {
			transform: `translate(${ left }px, ${ top + scrollTop }px)`,
			width: `${ width }px`,
			height: `${ height }px`,
		};

		return ReactDOM.createPortal(
			<Fragment>
				<div
					ref={ this.highlightRef }
					className="community-translator__highlight"
					style={ style }
				/>

				{ this.renderDeliverableForm() }
			</Fragment>,
			document.body
		);
	}

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
				{ this.renderDeliverableHighlight() }
			</Fragment>
		);
	}
}

export default connect(
	state => ( {
		isUserSettingsReady: !! getUserSettings( state ),
		isTranslatorEnabled: getOriginalUserSetting( state, 'enable_translator' ),
		selectedLanguageSlug: getCurrentLocaleSlug( state ),
	} ),
	{ setLocale }
)( localize( TranslatorLauncher ) );
