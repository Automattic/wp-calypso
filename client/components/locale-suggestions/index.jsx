/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React, { Component } from 'react';
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import switchLocale from 'lib/i18n-utils/switch-locale';
import LocaleSuggestionStore from 'lib/locale-suggestions';
import Notice from 'components/notice';

class LocaleSuggestions extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			dismissed: false,
			locales: LocaleSuggestionStore.get(),
		};
	}

	componentWillMount() {
		if ( this.props.locale ) {
			switchLocale( this.props.locale );
		}
	}

	componentDidMount() {
		LocaleSuggestionStore.on( 'change', this.updateLocales );
	}

	componentWillUnmount() {
		LocaleSuggestionStore.off( 'change', this.updateLocales );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.locale !== nextProps.locale ) {
			switchLocale( nextProps.locale );
		}
	}

	dismiss = () => {
		this.setState( { dismissed: true } );
	};

	handleLocaleSuggestionClick( locale, event ) {
		// TODO: record analytics event here
		this.reloadIfLanguageDirectionChanges( locale, event );
	}

	hasLocaleDirectionChanged( locale ) {
		const localeData = assign( {}, i18nUtils.getLanguage( locale ) ),
			currentLocaleData = assign( {}, i18nUtils.getLanguage( i18n.getLocaleSlug() ) );

		return localeData.rtl !== currentLocaleData.rtl;
	}

	reloadIfLanguageDirectionChanges( locale, event ) {
		if ( this.hasLocaleDirectionChanged( locale ) ) {
			event.preventDefault();
			window.location = this.getPathWithLocale( locale );
		}
	}

	getPathWithLocale = locale => {
		return i18nUtils.addLocaleToPath( this.props.path, locale );
	};

	updateLocales = () => {
		this.setState( { locales: LocaleSuggestionStore.get() } );
	};

	render() {
		if ( ! this.state.locales || this.state.dismissed ) {
			return null;
		}

		const usersOtherLocales = this.state.locales.filter( function( locale ) {
			return locale.locale !== i18n.getLocaleSlug();
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const localeMarkup = usersOtherLocales.map( function( locale, index ) {
			return (
				<div className="locale-suggestions__list-item" key={ 'locale-' + index } dir="auto">
					{ locale.availability_text }
					<a
						href={ this.getPathWithLocale( locale.locale ) }
						onClick={ this.handleLocaleSuggestionClick.bind( this, locale.locale ) }
						className="locale-suggestions__locale-link"
					>
						{ locale.name }
					</a>
				</div>
			);
		}, this );

		return (
			<div className="locale-suggestions">
				<Notice icon="globe" showDismiss={ true } onDismissClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</Notice>
			</div>
		);
	}
}

export default LocaleSuggestions;
