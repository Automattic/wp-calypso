/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import switchLocale from 'lib/i18n-utils/switch-locale';
import LocaleSuggestionStore from 'lib/locale-suggestions';

import Notice from 'components/notice';

module.exports = React.createClass( {
	displayName: 'LocaleSuggestions',

	getInitialState: function() {
		return {
			dismissed: false,
			locales: LocaleSuggestionStore.get()
		};
	},

	componentWillMount: function() {
		if ( this.props.locale ) {
			switchLocale( this.props.locale );
		}
	},

	componentDidMount: function() {
		LocaleSuggestionStore.on( 'change', this.updateLocales );
	},

	componentWillUnmount: function() {
		LocaleSuggestionStore.off( 'change', this.updateLocales );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.locale !== nextProps.locale ) {
			switchLocale( nextProps.locale );
		}
	},

	dismiss: function() {
		this.setState( { dismissed: true } );
	},

	handleLocaleSuggestionClick: function( locale, event ) {
		// TODO: record analytics event here
		this.reloadIfLanguageDirectionChanges( locale, event );
	},

	hasLocaleDirectionChanged: function( locale ) {
		var localeData = assign( {}, i18nUtils.getLanguage( locale ) ),
			currentLocaleData = assign( {}, i18nUtils.getLanguage( i18n.getLocaleSlug() ) );

		return localeData.rtl !== currentLocaleData.rtl;
	},

	reloadIfLanguageDirectionChanges: function( locale, event ) {
		if ( this.hasLocaleDirectionChanged( locale ) ) {
			event.preventDefault();
			window.location = this.getPathWithLocale( locale );
		}
	},

	getPathWithLocale: function( locale ) {
		return i18nUtils.addLocaleToPath( this.props.path, locale );
	},

	updateLocales: function() {
		this.setState( { locales: LocaleSuggestionStore.get() } );
	},

	render: function() {
		var usersOtherLocales, localeMarkup;
		if ( ! this.state.locales || this.state.dismissed ) {
			return null;
		}

		usersOtherLocales = this.state.locales.filter( function( locale ) {
			return locale.locale !== i18n.getLocaleSlug();
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		localeMarkup = usersOtherLocales.map( function( locale, index ) {
			return (
				<div className="locale-suggestions__list-item" key={ 'locale-' + index } dir="auto">
					{ locale.availability_text }
					<a href={ this.getPathWithLocale( locale.locale ) }
						onClick={ this.handleLocaleSuggestionClick.bind( this, locale.locale ) }
						className="locale-suggestions__locale-link">
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
} );
