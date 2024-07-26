import { MaterialIcon } from '@automattic/components';
import languages from '@automattic/languages';
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
			location: this.props.path,
		} );

	renderLearnMoreLink = () => {
		const { locale, translate } = this.props;
		return (
			<a
				className="translator-invite__link is-link"
				href={ `https://translate.wordpress.com/projects/wpcom/${ locale }/default/` }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.recordClick }
			>
				{ translate( 'Learn more' ) }
			</a>
		);
	};

	renderIconAndHeader = () => {
		const { translate } = this.props;

		return (
			<>
				<MaterialIcon icon="emoji_language" />
				<h2 className="translator-invite__content notice-header">
					{ translate( 'Translate WordPress.com' ) }
				</h2>
			</>
		);
	};

	renderNoticeLabelText() {
		const { locale, localizedLanguageNames, translate } = this.props;

		if ( ! localizedLanguageNames || ! localizedLanguageNames[ locale ] ) {
			return null;
		}

		const languageName = localizedLanguageNames[ locale ].localized;
		const currentLanguage = languages.find( ( language ) => language.langSlug === locale );
		const percentTranslated = currentLanguage?.calypsoPercentTranslated || 0;

		// translators: '%(languageName)s is a localized language name, %(percentTranslated)d%% is a percentage number (0-100), followed by an escaped percent sign %%'
		const noticeText = translate(
			'%(languageName)s is only %(percentTranslated)d%% translated. Help translate WordPress into your language.',
			{
				args: { languageName, percentTranslated },
			}
		);

		return <div className="translator-invite__content notice-description">{ noticeText }</div>;
	}

	render() {
		const { locale } = this.props;
		const currentLanguage = languages.find( ( language ) => language.langSlug === locale );
		const percentTranslated = currentLanguage?.calypsoPercentTranslated || 0;

		if ( percentTranslated >= 85 ) {
			return null;
		}

		return (
			<div className="translator-invite">
				{ this.renderIconAndHeader() }
				{ this.renderNoticeLabelText() }
				{ this.renderLearnMoreLink() }
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
