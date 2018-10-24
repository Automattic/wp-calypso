/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'i18n-calypso';
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import { addLocaleToPath, getLanguage } from 'lib/i18n-utils';
import LocaleSuggestionsListItem from './list-item';
import QueryLocaleSuggestions from 'components/data/query-locale-suggestions';
import Notice from 'components/notice';
import getLocaleSuggestions from 'state/selectors/get-locale-suggestions';
import { setLocale } from 'state/ui/language/actions';

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

	UNSAFE_componentWillMount() {
		let { locale } = this.props;

		// In case no default locale is specified, we try to set on based on the user's
		// first browser language.
		if ( ! locale && typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					locale = language.langSlug;
					break;
				}
			}

			if ( locale ) {
				this.props.setLocale( locale );
			}
		}
	}

	dismiss = () => this.setState( { dismissed: true } );

	getPathWithLocale = locale => addLocaleToPath( this.props.path, locale );

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		const { localeSuggestions } = this.props;

		if ( ! localeSuggestions ) {
			return <QueryLocaleSuggestions />;
		}

		const usersOtherLocales = localeSuggestions.filter( function( locale ) {
			return ! startsWith( getLocaleSlug(), locale.locale );
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const localeMarkup = usersOtherLocales.map( locale => {
			return (
				<LocaleSuggestionsListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
					onLocaleSuggestionClick={ this.dismiss }
					path={ this.getPathWithLocale( locale.locale ) }
				/>
			);
		} );

		return (
			<div className="locale-suggestions">
				<Notice icon="globe" showDismiss={ true } onDismissClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</Notice>
			</div>
		);
	}
}

export default connect(
	state => ( {
		localeSuggestions: getLocaleSuggestions( state ),
	} ),
	{ setLocale }
)( LocaleSuggestions );
