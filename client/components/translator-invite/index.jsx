/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentNonDefaultLocale } from 'calypso/components/translator-invite/utils';

/**
 * Style dependencies
 */
import './style.scss';

export class TranslatorInvite extends Component {
	static propTypes = {
		locale: PropTypes.string,
		localizedLanguageNames: PropTypes.object,
		path: PropTypes.string.isRequired,
	};

	static defaultProps = {
		locale: '',
		localizedLanguageNames: {},
		path: '',
	};

	recordClick = () =>
		this.props.recordTracksEvent( 'calypso_translator_invitation', {
			language: this.props.localizedLanguageNames[ this.props.locale ].en,
		} );

	renderNoticeLabelText() {
		const { locale, localizedLanguageNames, translate } = this.props;

		if ( localizedLanguageNames && localizedLanguageNames[ locale ] ) {
			return (
				<div className="translator-invite__content">
					<Gridicon className="translator-invite__gridicon" icon="globe" size={ 18 } />
					{ translate(
						'Would you like to help us translate WordPress.com into {{a}}%(language)s{{/a}}?',
						{
							args: { language: localizedLanguageNames[ locale ].localized },
							comment:
								'The language variable can be any major spoken language that WordPress.com supports',
							components: {
								a: (
									<a
										href={ `https://translate.wordpress.com/projects/wpcom/${ locale }/default/` }
										onClick={ this.recordClick }
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
		return (
			<div className="translator-invite">
				{ this.renderNoticeLabelText() }
				<QueryLanguageNames />
			</div>
		);
	}
}

export default connect(
	( state, props ) => ( {
		localizedLanguageNames: getLocalizedLanguageNames( state ),
		locale: getCurrentNonDefaultLocale( getCurrentLocaleSlug( state ), props.path ),
	} ),
	{ recordTracksEvent }
)( localize( TranslatorInvite ) );
