/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Notice from 'components/notice';
import QueryLanguageNames from 'components/data/query-language-names';
import getLocalizedLanguageNames from 'state/selectors/get-localized-language-names';
import { getLanguage, getLocaleFromPath } from 'lib/i18n-utils';

/**
 * Module variables
 */
const defaultLanguageSlug = config( 'i18n_default_locale_slug' );

export class TranslatorInvite extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
	};

	static defaultProps = {
		locale: '',
		path: '',
	};

	state = {
		dismissed: false,
	};

	isDefaultLocale( browserLanguage ) {
		return startsWith( browserLanguage, defaultLanguageSlug );
	}

	getLocale() {
		// First try the locale.
		let browserLanguage = ! this.isDefaultLocale( this.props.locale ) ? this.props.locale : null;

		// Then the path.
		if ( ! browserLanguage && this.props.path ) {
			browserLanguage = getLocaleFromPath( this.props.path );
			browserLanguage = ! this.isDefaultLocale( browserLanguage ) ? browserLanguage : null;
		}

		// Then navigator.languages.
		if ( ! browserLanguage && typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language && ! this.isDefaultLocale( language.langSlug ) ) {
					browserLanguage = language.langSlug;
					break;
				}
			}
		}

		if ( browserLanguage ) {
			return browserLanguage;
		}

		return null;
	}

	dismiss = () => this.setState( { dismissed: true } );

	renderNoticeLabelText() {
		const { localizedLanguageNames } = this.props;
		const locale = this.getLocale();

		if ( localizedLanguageNames && localizedLanguageNames[ locale ] ) {
			return (
				<Notice icon="globe" showDismiss={ true } onDismissClick={ this.dismiss }>
					<div className="translator-invite__content">
						Would you like to help us translate WordPress into{' '}
						<a
							href={ `https://translate.wordpress.com/projects/wpcom/${ locale }/default/` }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ localizedLanguageNames[ locale ].en }
						</a>?
					</div>
				</Notice>
			);
		}

		return null;
	}

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		return (
			<div className="translator-invite">
				{ this.renderNoticeLabelText() }
				<QueryLanguageNames />
			</div>
		);
	}
}

export default connect(
	state => ( {
		localizedLanguageNames: getLocalizedLanguageNames( state ),
	} ),
	null
)( TranslatorInvite );
