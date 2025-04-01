import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
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
		localeSuggestions: PropTypes.shape( {
			locales: PropTypes.array,
			availability_text: PropTypes.string,
		} ),
	};

	static defaultProps = {
		locale: '',
		localeSuggestions: {
			locales: [],
			availability_text: '',
		},
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
		const { locales, availability_text } = localeSuggestions;

		const usersOtherLocales = locales.filter( function ( locale ) {
			return ! locale.locale.startsWith( getLocaleSlug() );
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const localeSuggestionsMap = usersOtherLocales.reduce( ( acc, locale, index ) => {
			acc[ `LocaleSuggestion${ index }` ] = (
				<LocaleSuggestionsListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
					onLocaleSuggestionClick={ this.dismiss }
					path={ this.getPathWithLocale( locale.locale ) }
					recordLocaleSuggestionClick={ this.recordLocaleSuggestionClick }
				/>
			);

			return acc;
		}, {} );

		const availabilityTextWithComponents = sprintf(
			availability_text,
			...Object.keys( localeSuggestionsMap ).map( ( componentKey ) => `<${ componentKey } />` )
		);

		const availabilityTextInterpolated = createInterpolateElement(
			availabilityTextWithComponents,
			localeSuggestionsMap
		);

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
					{ availabilityTextInterpolated }
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
