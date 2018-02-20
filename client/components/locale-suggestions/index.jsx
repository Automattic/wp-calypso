/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleToPath, getLanguage } from 'lib/i18n-utils';
import LocaleSuggestionsListItem from './list-item';
import QueryLocaleSuggestions from 'components/data/query-locale-suggestions';
import Notice from 'components/notice';
import { getLocaleSuggestions } from 'state/selectors';
import switchLocale from 'lib/i18n-utils/switch-locale';

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

	componentWillMount() {
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

		switchLocale( locale );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.locale !== nextProps.locale ) {
			switchLocale( nextProps.locale );
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
			return locale.locale !== getLocaleSlug();
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

export default connect( state => ( {
	localeSuggestions: getLocaleSuggestions( state ),
} ) )( LocaleSuggestions );
