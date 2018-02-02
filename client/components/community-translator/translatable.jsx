/** @format */
/**
 * External dependencies
 */
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import { getTranslationData } from 'state/i18n/community-translator/actions';
import { getCommunityTranslatorStringData } from 'state/selectors';
// import FormFieldset from 'components/forms/form-fieldset';
// import FormTextInput from 'components/forms/form-text-input';
// import FormButton from 'components/forms/form-button';
// import FormLabel from 'components/forms/form-label';

class Translatable extends Component {
	state = {
		showDialog: false,
	};

	closeDialog = () => this.setState( { showDialog: false } );

	openDialog = event => {
		event.preventDefault();

		this.setState( { showDialog: true } );

		const { singular, context, plural, locale, translationData, fetchTranslationData } = this.props;
		! translationData && fetchTranslationData( locale.langSlug, { singular, context, plural } );
	};

	getDialogButtons = () => {
		const { translate } = this.props;
		return [
			<Button primary onClick={ this.closeDialog }>
				{ translate( 'Close', { textOnly: true } ) }
			</Button>,
			<Button primary onClick={ noop }>
				Submit a new translation
			</Button>,
		];
	};

	render() {
		const { untranslated, locale, translationData, children } = this.props;

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
						<div className="community-translator__dialog-content">
							<header className="community-translator__dialog-header">
								<h1>Translate to { locale.name }</h1>
							</header>
							<header className="community-translator__dialog-body">
								<dfn>{ JSON.stringify( translationData ) }</dfn>
							</header>
						</div>
					</Dialog>
				) }
			</span>
		);
	}
}

export default connect(
	( state, props ) => ( {
		translationData: getCommunityTranslatorStringData( state, props.singular ),
	} ),
	{
		fetchTranslationData: getTranslationData,
	},
)( localize( Translatable ) );

