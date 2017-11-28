/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleToPath } from 'lib/i18n-utils';
import LocaleSuggestionsListItem from './list-item';
import LocaleSuggestionStore from 'lib/locale-suggestions';
import Notice from 'components/notice';
import switchLocale from 'lib/i18n-utils/switch-locale';

class LocaleSuggestions extends Component {
	static propTypes = {
		locale: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
	};

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

export default LocaleSuggestions;
