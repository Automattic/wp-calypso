import config from '@automattic/calypso-config';
import { MaterialIcon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import { getCurrentNonDefaultLocale } from 'calypso/components/translator-invite/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';

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
					<MaterialIcon icon="emoji_language" /> <br />
					<h2>{ translate( 'Translate WordPress.com' ) }</h2>
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
		const { locale } = this.props;

		if ( config( 'i18n_default_locale_slug' ) === locale ) {
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
	( state, props ) => ( {
		localizedLanguageNames: getLocalizedLanguageNames( state ),
		locale: getCurrentNonDefaultLocale( getCurrentLocaleSlug( state ), props.path ),
	} ),
	{ recordTracksEvent }
)( localize( TranslatorInvite ) );
