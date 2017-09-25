/**
 * External dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import LocaleSuggestionListItem from './list-item';
import Notice from 'components/notice';
import { addLocaleToPath } from 'lib/i18n-utils';
import switchLocale from 'lib/i18n-utils/switch-locale';
import LocaleSuggestionStore from 'lib/locale-suggestions';

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
				<LocaleSuggestionListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
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
