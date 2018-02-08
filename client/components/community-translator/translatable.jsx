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
					originalData,
					translationUrl: getTranslationGlotPressUrl( locale.langSlug, originalData.originalId ),
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

	renderDialogContent() {
		const placeHolderClass = classNames( {
			placeholder: ! this.hasDataLoaded(),
		} );

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
						<label htmlFor="community-translator__singular" className={ placeHolderClass }>
							<span>{ this.props.singular }</span>
							<textarea
								className={ placeHolderClass }
								id="community-translator__singular"
								name="translatedSingular"
								value={ this.state.formState.translatedSingular }
								onChange={ this.handleTranslationChange }
							/>
						</label>
						{ this.state.formState.translatedPlural && (
							<label htmlFor="community-translator__plural" className={ placeHolderClass }>
								<span>{ this.props.plural }</span>
								<textarea
									className={ placeHolderClass }
									id="community-translator__plural"
									name="translatedPlural"
									value={ this.state.formState.translatedPlural }
									onChange={ this.handleTranslationChange }
								/>
							</label>
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
			<span className={ classes } onContextMenu={ this.openDialog }>
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
			</span>
		);
	}
}

export default localize( Translatable );
