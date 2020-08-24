/**
 * External dependencies
 */
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import TranslatableTextarea from './translatable-textarea';
import TranslatedSuccess from './translated-success';
import { getSingleTranslationData, getTranslationPermaLink, submitTranslation } from './utils.js';

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

	hasDataLoaded() {
		return ! isEmpty( this.state.originalData ) || ! isEmpty( this.state.error );
	}

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

		const { singular, context, plural, locale } = this.props;

		if ( ! this.hasDataLoaded() ) {
			getSingleTranslationData( locale, { singular, context, plural } )
				.then( ( originalData ) =>
					this.setState( {
						originalData,
						translationUrl: getTranslationPermaLink( originalData.originalId, locale ),
						formState: {
							translatedSingular: originalData.translatedSingular,
							translatedPlural: originalData.translatedPlural,
						},
					} )
				)
				.catch( () => {
					this.setState( {
						error: TRANSLATION_FETCH_ERROR,
					} );
				} );
		}
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
		const { error, submissionSuccess, originalData, submitting, formState } = this.state;

		if ( error ) {
			return (
				<p className="community-translator__string-container">
					{ this.getErrorMessage( this.state.error ) }
				</p>
			);
		}

		if ( submissionSuccess ) {
			return <TranslatedSuccess translationUrl={ this.state.translationUrl } />;
		}

		return [
			originalData.comment && <p key="translationComment">{ originalData.comment }</p>,

			<TranslatableTextarea
				key="translatedSingular"
				originalString={ this.props.singular }
				title="Singular"
				fieldName="translatedSingular"
				onChange={ this.handleTranslationChange }
				disabled={ submitting }
				value={ formState.translatedSingular }
			/>,

			this.state.formState.translatedPlural && (
				<TranslatableTextarea
					key="translatedPlural"
					originalString={ this.props.plural }
					title="Plural"
					fieldName="translatedPlural"
					onChange={ this.handleTranslationChange }
					disabled={ submitting }
					value={ formState.translatedPlural }
				/>
			),
		];
	}

	renderDialogContent() {
		const { translate } = this.props;

		return (
			<div className="community-translator__dialog-content">
				<header className="community-translator__dialog-header">
					<h2>
						{ translate( 'Translate to %(localeName)s', {
							args: { localeName: this.props.locale.name },
						} ) }
					</h2>
					<nav>
						{ this.state.translationUrl && (
							<a
								target="_blank"
								rel="noopener noreferrer"
								title={ translate( 'Open this translation in translate.wordpress.com' ) }
								href={ this.state.translationUrl }
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
					<fieldset>
						{ this.hasDataLoaded() ? this.renderTranslatableContent() : this.renderPlaceholder() }
					</fieldset>
				</section>
			</div>
		);
	}

	render() {
		const { untranslated, children } = this.props;

		const classes = classNames( 'translatable community-translator__element', {
			'is-untranslated': untranslated,
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
