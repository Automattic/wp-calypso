/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	i18nUtils = require( 'lib/i18n-utils' ),
	LocaleSuggestionStore = require( 'lib/locale-suggestions' ),
	SimpleNotice = require( 'notices/simple-notice' );

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
			i18n.setLocaleSlug( this.props.locale );
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
			i18n.setLocaleSlug( nextProps.locale );
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
		return i18nUtils.removeLocaleFromPath( this.props.path ) + '/' + locale;
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
				<SimpleNotice status="is-info" showDismiss={ true } onClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</SimpleNotice>
			</div>
		);
	}
} );
