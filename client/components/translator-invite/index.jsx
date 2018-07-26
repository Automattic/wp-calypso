/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import QueryLanguageNames from 'components/data/query-language-names';
import getLocalizedLanguageNames from 'state/selectors/get-localized-language-names';
import { getLanguage, getLocaleFromPath } from 'lib/i18n-utils';
import { recordTracksEvent } from 'state/analytics/actions';
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

	constructor( props ) {
		super( props );
		this.state = {
			locale: this.getLocale(),
		};
	}

	isDefaultLocale( languageSlug ) {
		return startsWith( languageSlug, defaultLanguageSlug );
	}

	getLocale() {
		// First try the locale passed as props.
		let browserLanguage = ! this.isDefaultLocale( this.props.locale ) ? this.props.locale : null;

		// Then the locale in the path, if any.
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

	recordClick = () =>
		this.props.recordTracksEvent( 'calypso_translator_invitation', {
			language: this.props.localizedLanguageNames[ this.state.locale ].en,
		} );

	renderNoticeLabelText() {
		const { localizedLanguageNames, translate } = this.props;
		const { locale } = this.state;

		if ( localizedLanguageNames && localizedLanguageNames[ locale ] ) {
			return (
				<div className="translator-invite__content">
					<Gridicon className="translator-invite__gridicon" icon="globe" size={ 18 } />
					{ translate(
						'Would you like to help us translate WordPress into {{a}}%(language)s{{/a}}?',
						{
							args: { language: localizedLanguageNames[ locale ].localized },
							comment:
								'The language variable can be any major spoken language that WordPress supports',
							components: {
								a: (
									<a
										href={ `https://translate.wordpress.com/projects/wpcom/${ locale }/default/` }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</div>
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
	{ recordTracksEvent }
)( localize( TranslatorInvite ) );
