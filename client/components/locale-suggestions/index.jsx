import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { getLocaleSlug, translate } from 'i18n-calypso';
import startsWith from 'lodash/startsWith';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import Notice from 'calypso/components/notice';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import { setLocale } from 'calypso/state/ui/language/actions';

import './style.scss';

export class LocaleSuggestions extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		localeSuggestions: PropTypes.array,
	};

	static defaultProps = {
		locale: '',
		localeSuggestions: [],
	};

	state = {
		dismissed: false,
	};

	componentDidMount() {
		let { locale } = this.props;

		if ( ! locale && typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					locale = language.langSlug;
					break;
				}
			}
		}

		this.props.setLocale( locale );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.locale !== this.props.locale ) {
			this.props.setLocale( this.props.locale );
		}
	}

	dismiss = () => this.setState( { dismissed: true } );

	getPathWithLocale = ( locale ) => addLocaleToPath( this.props.path, locale );

	recordLocaleSuggestionClick = ( locale ) => {
		recordTracksEvent( 'calypso_locale_suggestion_click', {
			sourceLocale: getLocaleSlug(),
			targetLocale: locale,
			path: this.props.path,
		} );
	};

	handleLocaleSuggestionClick = ( event, locale ) => {
		this.recordLocaleSuggestionClick( locale );

		const localeData = getLanguage( locale );
		const currentLocaleData = getLanguage( getLocaleSlug() );

		if ( localeData.rtl !== currentLocaleData.rtl ) {
			event.preventDefault();
			window.location = this.getPathWithLocale( locale );
		}

		this.dismiss();
	};

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		const { localeSuggestions } = this.props;

		if ( ! localeSuggestions ) {
			return <QueryLocaleSuggestions />;
		}

		const usersOtherLocales = localeSuggestions.filter( function ( locale ) {
			return ! startsWith( getLocaleSlug(), locale.locale );
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const createLinkElement = ( localeItem ) => (
			<a
				key={ localeItem.locale }
				href={ this.getPathWithLocale( localeItem.locale ) }
				onClick={ ( event ) => this.handleLocaleSuggestionClick( event, localeItem.locale ) }
				className="locale-suggestions__locale-link"
			/>
		);

		let translatedString;
		if ( usersOtherLocales.length === 1 ) {
			const locale = usersOtherLocales[ 0 ];
			translatedString = createInterpolateElement(
				translate( 'Also available in <link>%(language)s</link>', {
					args: { language: locale.name },
					comment:
						'language is a single translated name e.g. in Greek for Greek, in French for French',
				} ),
				{
					link: createLinkElement( locale ),
				}
			);
		} else {
			// An object of link elements for interpolation
			const links = Object.fromEntries(
				usersOtherLocales.map( ( locale, index ) => [
					`link${ index }`,
					createLinkElement( locale ),
				] )
			);

			// A list of translated language names marked for interpolation
			const languages = usersOtherLocales.map(
				( locale, index ) => `<link${ index }>${ locale.name }</link${ index }>`
			);

			translatedString = createInterpolateElement(
				translate( 'Also available in %(allButLastLanguage)s and %(lastLanguage)s', {
					args: {
						allButLastLanguage: languages.slice( 0, -1 ).join( ', ' ),
						lastLanguage: languages.slice( -1 ),
					},
					comment:
						'languages is a comma-separated list of translated language names (in Greek for Greek language, in French for French, etc.)',
				} ),
				links
			);
		}

		return (
			<div className="locale-suggestions">
				<Notice
					className="locale-suggestions__notice"
					icon="globe"
					showDismiss
					onDismissClick={ this.dismiss }
					isCompact
					theme="light"
					status="is-info"
				>
					<div className="locale-suggestions__list">{ translatedString }</div>
				</Notice>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		localeSuggestions: getLocaleSuggestions( state ),
	} ),
	{ setLocale }
)( LocaleSuggestions );
