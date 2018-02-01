/** @format */
/**
 * External dependencies
 */
//import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
// import FormFieldset from 'components/forms/form-fieldset';
// import FormTextInput from 'components/forms/form-text-input';
// import FormButton from 'components/forms/form-button';
// import FormLabel from 'components/forms/form-label';

class Translatable extends Component {
	state = {
		showDialog: false,
		translatedData: null,
	};

	closeDialog = () => this.setState( { showDialog: false } );

	openDialog = event => {
		event.preventDefault();

		this.setState( { showDialog: true } );

		if ( this.state.translatedData ) {
			return;
		}

		const { singular, context, plural } = this.props;

		// TODO abstract this HTTP call
		/* temp xhr code for demonstration purposes */
		const xhr = new XMLHttpRequest();

		if ( 'withCredentials' in xhr ) {
			xhr.open(
				'POST',
				'https://translate.wordpress.com/api/translations/-query-by-originals',
				true
			);
			xhr.withCredentials = true;
			xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

			const data = {
				project: 'wpcom',
				locale_slug: 'it',
				original_strings: { singular, context, plural },
			};

			xhr.onreadystatechange = () => {
				if ( xhr.readyState > 3 && xhr.status === 200 ) {
					this.setState( { translatedData: JSON.parse( xhr.responseText ) } );
				}
			};
			const params = `project=wpcom&locale_slug=it&original_strings=${ encodeURIComponent(
				JSON.stringify( data )
			) }`;

			xhr.send( params );
		}
	};

	getDialogButtons = () => [
		<Button primary onClick={ this.closeDialog }>
			Close
		</Button>,
		<Button primary onClick={ noop }>
			Submit a new translation
		</Button>,
	];

	render() {
		// const translatedStr = this.state.translatedData ? this.state.translatedData[ 0 ].translations[0][ 'translation_0' ] : '';
		const { untranslated, locale } = this.props;

		const classes = classNames( 'translatable translatable__element', {
			'is-untranslated': untranslated,
		} );

		// eslint-disable-next-line
		//console.log( 'this.state.translatedData', this.state.translatedData );
		return (
			<dfn className={ classes } onContextMenu={ this.openDialog } { ...this.props }>
				{ this.props.children }

				{ this.state.showDialog && (
					<Dialog
						isVisible={ this.state.showDialog }
						buttons={ this.getDialogButtons() }
						additionalClassNames="translatable__dialog"
					>
						<div className="translatable__dialog-content">
							<header className="translatable__dialog-header">
								<h1>Translate to { locale.name }</h1>
							</header>
							<header className="translatable__dialog-body">
								<p>{ this.props.singular }</p>
							</header>
						</div>
					</Dialog>
				) }
			</dfn>
		);
	}
}

export default Translatable;
