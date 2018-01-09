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
import LocaleSuggestionStore from 'lib/locale-suggestions';
import Notice from 'components/notice';
import { setLocale } from 'state/ui/language/actions';

class LocaleSuggestions extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		setLocale: PropTypes.func.isRequired,
	};

	state = {
		dismissed: false,
		locales: null,
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

		this.props.setLocale( locale );
	}

	componentDidMount() {
		LocaleSuggestionStore.on( 'change', this.updateLocales );

		this.updateLocales();
	}

	componentWillUnmount() {
		LocaleSuggestionStore.off( 'change', this.updateLocales );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.locale !== nextProps.locale ) {
			this.props.setLocale( nextProps.locale );
		}
	}

	dismiss = () => {
		this.setState( { dismissed: true } );
	};

	getPathWithLocale = locale => {
		return addLocaleToPath( this.props.path, locale );
	};

	updateLocales = () => {
		this.setState( { locales: LocaleSuggestionStore.get() } );
	};

	render() {
		if ( ! this.state.locales || this.state.dismissed ) {
			return null;
		}

		const usersOtherLocales = this.state.locales.filter( function( locale ) {
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

export default connect( null, {
	setLocale,
} )( LocaleSuggestions );
