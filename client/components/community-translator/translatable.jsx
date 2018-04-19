/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import TranslatableTextarea from './translatable-textarea';
import TranslatedSuccess from './translated-success';
import { getTranslationData, getTranslationPermaLink, submitTranslation } from './utils.js';

export class Translatable extends Component {
	state = {
		showDialog: false,
		originalData: {},
		formState: {},
	};

	hasDataLoaded() {
		return ! isEmpty( this.state.originalData );
	}

	handleTranslationChange = event => {
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

	openDialog = event => {
		event.preventDefault();

		this.setState( { showDialog: true } );

		const { singular, context, plural, locale } = this.props;
		! this.hasDataLoaded() &&
			getTranslationData( locale, { singular, context, plural } ).then( originalData =>
				this.setState( {
					error: originalData.error,
					originalData,
					translationUrl: getTranslationPermaLink( originalData.originalId, locale ),
					formState: {
						translatedSingular: originalData.translatedSingular,
						translatedPlural: originalData.translatedPlural,
					},
				} )
			);
	};

	submitForm = () => {
		this.setState( {
			submitting: true,
		} );
		submitTranslation(
			this.state.originalData.originalId,
			this.state.formState,
			this.props.locale
		).then( originalData => {
			this.setState( {
				error: originalData.error,
				originalData,
				submitting: false,
				submissionSuccess: true,
			} );
		} );
	};

	getDialogButtons = () => {
		const buttons = [
			<Button primary onClick={ this.closeDialog }>
				{ this.props.translate( 'Close', { textOnly: true } ) }
			</Button>,
		];
		! this.state.submissionSuccess &&
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
					Submit a new translation
				</Button>
			);
		return buttons;
	};

	renderTranslatableContent() {
		if ( this.state.submissionSuccess ) {
			return <TranslatedSuccess translationUrl={ this.state.translationUrl } />;
		}

		if ( this.state.originalData.error ) {
			return (
				<p className="community-translator__string-container">{ this.state.originalData.error }</p>
			);
		}

		return [
			this.state.originalData.comment && (
				<p key="translationComment">{ this.state.originalData.comment }</p>
			),
			<TranslatableTextarea
				key="translatedSingular"
				originalString={ this.props.singular }
				title="Singular"
				fieldName="translatedSingular"
				onChange={ this.handleTranslationChange }
				disabled={ this.state.submitting }
				value={ this.state.formState.translatedSingular }
			/>,

			this.state.formState.translatedPlural && (
				<TranslatableTextarea
					key="translatedPlural"
					originalString={ this.props.plural }
					title="Plural"
					fieldName="translatedPlural"
					onChange={ this.handleTranslationChange }
					disabled={ this.state.submitting }
					value={ this.state.formState.translatedPlural }
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
						<Gridicon icon="help" className="community-translator__nav-link" size={ 12 } />
					</nav>
				</header>
				<section className="community-translator__dialog-body">
					<fieldset>
						{ this.hasDataLoaded() ? (
							this.renderTranslatableContent()
						) : (
							<div className="community-translator__string-container placeholder">
								<span className="community-translator__string-description" />
								<span />
							</div>
						) }
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
