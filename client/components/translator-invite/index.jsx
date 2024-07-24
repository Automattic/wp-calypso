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
			location: this.props.path,
		} );

	renderNoticeLabelText() {
		const { locale, localizedLanguageNames, translate } = this.props;
		if ( localizedLanguageNames && localizedLanguageNames[ locale ] ) {
			return (
				<>
					<MaterialIcon icon="emoji_language" /> <br />
					<h2 className="card-heading card-heading-20">
						{ translate( 'Translate WordPress.com' ) }
					</h2>
					<div className="language-picker__modal-incomplete-locale-notice-info">
						{
							/* translators: %(languageName)s is a localized language name, %(percentTranslated)d%% is a percentage number (0-100), followed by an escaped percent sign %%. */
							// sprintf( __( '%(languageName)s is only %(percentTranslated)d%% translated' ), {
							// 	languageName,
							// 	percentTranslated,
							// } )
						 }
					</div>
				</>
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
