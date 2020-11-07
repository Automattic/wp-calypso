/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import TranslatableTextarea from './translatable-textarea';
import TranslatedSuccess from './translated-success';
import { getTranslationPermaLink, submitTranslation } from './utils.js';

/**
 * Module varialbles
 */
const TRANSLATION_FETCH_ERROR = 'translation-fetch-error';
const TRANSLATION_SUBMIT_ERROR = 'tranlsation-submit-error';

export class Translatable extends Component {
	state = {
		showDialog: false,
		originalData: {},
		formState: {},
	};

	componentDidMount() {
		const { singular, context, plural, locale } = this.props;

		if ( ! this.hasRequestedData() ) {
			this.props.requestTranslationData( locale, { singular, context, plural } );
		}
	}

	hasRequestedData = () => {
		return this.props.translationData !== undefined;
	};

	hasDataLoaded = () => {
		return ! isEmpty( this.props.translationData );
	};

	isTranslated = () => {
		return this.hasDataLoaded() && ! isEmpty( this.props.translationData.translatedSingular );
	};

	isUntranslated = () => {
		return this.hasDataLoaded() && isEmpty( this.props.translationData.translatedSingular );
	};

	isUserTranslated = () => {
		return false;
	};

	handleTranslationChange = ( event ) => {
		const { name, value } = event.target;
		this.setState( {
			formState: {
				...this.state.formState,
				[ name ]: value,
			},
			submitting: false,
			submissionSuccess: false,
		} );
	};

	closeDialog = () => {
		this.setState( {
			showDialog: false,
			submissionSuccess: false,
			formState: this.state.submissionSuccess ? {} : this.state.formState,
			originalData: this.state.submissionSuccess ? {} : this.state.originalData,
		} );
	};

	openDialog = ( event ) => {
		event.preventDefault();

		this.setState( { showDialog: true } );
	};

	submitForm = () => {
		this.setState( {
			submitting: true,
		} );
		submitTranslation( this.state.originalData.originalId, this.state.formState, this.props.locale )
			.then( ( originalData ) => {
				this.setState( {
					error: originalData.error,
					originalData,
					submitting: false,
					submissionSuccess: true,
				} );
			} )
			.catch( () => {
				this.setState( {
					error: TRANSLATION_SUBMIT_ERROR,
				} );
			} );
	};

	getTranslationUrl = () => {
		const { locale, translationData } = this.props;

		if ( ! this.hasDataLoaded() || ! translationData.originalId ) {
			return null;
		}

		return getTranslationPermaLink( translationData.originalId, locale );
	};

	getDialogButtons = () => {
		const { translate } = this.props;

		const buttons = [
			<Button onClick={ this.closeDialog }>{ translate( 'Close', { textOnly: true } ) }</Button>,
		];

		if ( ! this.state.submissionSuccess ) {
			buttons.push(
				<Button
					primary
					onClick={ this.submitForm }
					disabled={
						this.state.originalData.translatedSingular ===
							this.state.formState.translatedSingular &&
						this.state.originalData.translatedPlural === this.state.formState.translatedPlural &&
						! this.state.submitting
					}
				>
					{ translate( 'Submit translation' ) }
				</Button>
			);
		}

		return buttons;
	};

	renderPlaceholder() {
		return (
			<div className="community-translator__string-container placeholder">
				<span className="community-translator__string-description" />
				<span />
			</div>
		);
	}

	getErrorMessage( errorType ) {
		const { translate } = this.props;

		switch ( errorType ) {
			case TRANSLATION_FETCH_ERROR:
				return translate( "Sorry, we couldn't find the translation for this string." );
			case TRANSLATION_SUBMIT_ERROR:
				return translate( "Sorry, we couldn't submit the translation for this string." );
			default:
				return translate( "Sorry, we've encountered an error." );
		}
	}

	renderTranslatableContent() {
		const { error, submissionSuccess, submitting, formState } = this.state;
		const { translationData } = this.props;

		if ( error ) {
			return (
				<p className="community-translator__string-container">
					{ this.getErrorMessage( this.state.error ) }
				</p>
			);
		}

		if ( submissionSuccess ) {
			return <TranslatedSuccess translationUrl={ this.getTranslationUrl() } />;
		}

		return (
			<Fragment>
				{ translationData.comment && <p key="translationComment">{ translationData.comment }</p> }

				<TranslatableTextarea
					key="translatedSingular"
					originalString={ this.props.singular }
					title="Singular"
					fieldName="translatedSingular"
					onChange={ this.handleTranslationChange }
					disabled={ submitting }
					value={ formState.translatedSingular }
				/>

				{ this.state.formState.translatedPlural && (
					<TranslatableTextarea
						key="translatedPlural"
						originalString={ this.props.plural }
						title="Plural"
						fieldName="translatedPlural"
						onChange={ this.handleTranslationChange }
						disabled={ submitting }
						value={ formState.translatedPlural }
					/>
				) }
			</Fragment>
		);
	}

	renderDialogContent() {
		const { translate } = this.props;
		const translationUrl = this.getTranslationUrl();

		return (
			<div className="community-translator__dialog-content">
				<header className="community-translator__dialog-header">
					<h2>
						{ translate( 'Translate to %(localeName)s', {
							args: { localeName: this.props.locale.name },
						} ) }
					</h2>
					<nav>
						{ translationUrl && (
							<a
								target="_blank"
								rel="noopener noreferrer"
								title={ translate( 'Open this translation in translate.wordpress.com' ) }
								href={ translationUrl }
								className="community-translator__nav-link"
							>
								<Gridicon icon="external" size={ 12 } />
							</a>
						) }
						<a
							title={ translate( 'Settings' ) }
							href={ '/me/account' }
							className="community-translator__settings-link"
						>
							<Gridicon icon="cog" size={ 12 } onClick={ this.closeDialog } />
						</a>
						<Gridicon icon="help" className="community-translator__nav-link" size={ 12 } />
						<Gridicon
							icon="cross-circle"
							className="community-translator__close-icon"
							size={ 12 }
							onClick={ this.closeDialog }
						/>
					</nav>
				</header>
				<section className="community-translator__dialog-body">
					<FormFieldset>
						{ this.hasDataLoaded() ? this.renderTranslatableContent() : this.renderPlaceholder() }
					</FormFieldset>
				</section>
			</div>
		);
	}

	render() {
		const { children } = this.props;

		const classes = classNames( 'translatable community-translator__element', {
			'is-translated': this.isTranslated(),
			'is-untranslated': this.isUntranslated(),
			'is-user-translated': this.isUserTranslated(),
		} );

		return (
			<data className={ classes } onContextMenu={ this.openDialog }>
				{ children }

				{ this.state.showDialog && (
					<Dialog
						isVisible={ this.state.showDialog }
						buttons={ this.getDialogButtons() }
						additionalClassNames="community-translator__dialog"
					>
						{ this.renderDialogContent() }
					</Dialog>
				) }
			</data>
		);
	}
}

export default localize( Translatable );
