/** @format */
/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { assign } from 'lodash';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLanguage } from 'lib/i18n-utils';

class LocaleSuggestionsListItem extends Component {
	static propTypes = {
		locale: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
	};

	handleLocaleSuggestionClick = event => {
		const { locale, path } = this.props;

		if ( this.hasLocaleDirectionChanged( locale ) ) {
			event.preventDefault();
			window.location = path;
		}

		// TODO: record analytics event here
	};

	hasLocaleDirectionChanged( locale ) {
		const localeData = assign( {}, getLanguage( locale.locale ) ),
			currentLocaleData = assign( {}, getLanguage( getLocaleSlug() ) );

		return localeData.rtl !== currentLocaleData.rtl;
	}

	render() {
		const { locale, path } = this.props;

		return (
			<div className="locale-suggestions__list-item" dir="auto">
				{ locale.availability_text }
				<a
					href={ path }
					onClick={ this.handleLocaleSuggestionClick }
					className="locale-suggestions__locale-link"
				>
					{ locale.name }
				</a>
			</div>
		);
	}
}

export default LocaleSuggestionsListItem;
