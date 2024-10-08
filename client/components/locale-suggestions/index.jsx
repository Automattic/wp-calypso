import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import { getLocaleSlug } from 'i18n-calypso';
import startsWith from 'lodash/startsWith';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import { setLocale } from 'calypso/state/ui/language/actions';
import LocaleSuggestionsListItem from './list-item';

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
		this.props.recordTracksEvent( 'calypso_locale_suggestion_click', {
			sourceLocale: getLocaleSlug(),
			targetLocale: locale?.locale,
			path: this.props.path,
		} );
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

		const localeMarkup = usersOtherLocales.map( ( locale ) => {
			return (
				<LocaleSuggestionsListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
					onLocaleSuggestionClick={ this.dismiss }
					path={ this.getPathWithLocale( locale.locale ) }
					recordLocaleSuggestionClick={ this.recordLocaleSuggestionClick }
				/>
			);
		} );

		return (
			<div className="locale-suggestions">
				<Notice icon="globe" showDismiss onDismissClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</Notice>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		localeSuggestions: getLocaleSuggestions( state ),
	} ),
	{ setLocale, recordTracksEvent }
)( LocaleSuggestions );
