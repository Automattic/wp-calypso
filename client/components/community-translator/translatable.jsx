/** @format */
/**
 * External dependencies
 */
//import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import TranslatableField from './translatable-field';
import { getTranslationData, getTranslationGlotPressUrl } from './utils.js';

class Translatable extends Component {
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
		} );
	};

	closeDialog = () => this.setState( { showDialog: false } );

	openDialog = event => {
		event.preventDefault();

		this.setState( { showDialog: true } );

		const { singular, context, plural, locale } = this.props;
		! this.hasDataLoaded() &&
			getTranslationData( locale.langSlug, { singular, context, plural } ).then( originalData =>
				this.setState( {
					error: originalData.error,
					originalData,
					translationUrl: getTranslationGlotPressUrl( originalData.originalId, locale.langSlug ),
					formState: {
						translatedSingular: originalData.translatedSingular,
						translatedPlural: originalData.translatedPlural,
					},
				} )
			);
	};

	getDialogButtons = () => {
		const { translate } = this.props;
		return [
			<Button primary onClick={ this.closeDialog }>
				{ translate( 'Close', { textOnly: true } ) }
			</Button>,
			<Button
				primary
				onClick={ noop }
				disabled={
					this.state.originalData.translatedSingular === this.state.formState.translatedSingular &&
					this.state.originalData.translatedPlural === this.state.formState.translatedPlural
				}
			>
				Submit a new translation
			</Button>,
		];
	};

	renderTranslatableFields() {
		if ( this.state.originalData.error ) {
			return <p className="community-translator__string-container"> {this.state.originalData.error} </p>;
		}
		return [
			<TranslatableField
				originalString={ this.props.singular }
				title="Singular"
				fieldName="translatedSingular"
				onChange={ this.handleTranslationChange }
				value={ this.state.formState.translatedSingular } />,

			this.state.formState.translatedPlural &&
			<TranslatableField
				originalString={ this.props.plural }
				title="Plural"
				fieldName="translatedPlural"
				onChange={ this.handleTranslationChange }
				value={ this.state.formState.translatedPlural } />
		];
	}

	renderDialogContent() {
		return (
			<div className="community-translator__dialog-content">
				<header className="community-translator__dialog-header">
					<h2>Translate to { this.props.locale.name }</h2>
					<nav>
						{ this.state.translationUrl && (
							<a
								target="_blank"
								rel="noopener noreferrer"
								title="Open this translation in translate.wordpress.com"
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
						{ this.hasDataLoaded()
							? this.renderTranslatableFields()
							: (
								<div className="community-translator__string-container placeholder">
									<span className="community-translator__string-description" />
									<span />
								</div> ) }
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
