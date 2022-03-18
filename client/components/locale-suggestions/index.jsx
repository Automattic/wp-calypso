import { getLocaleSlug } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import Notice from 'calypso/components/notice';
import { addLocaleToPath } from 'calypso/lib/i18n-utils';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import LocaleSuggestionsListItem from './list-item';

import './style.scss';

export function LocaleSuggestions( { path, localeSuggestions } ) {
	const [ dismissed, setDismissed ] = useState( false );

	if ( dismissed ) {
		return null;
	}

	if ( ! localeSuggestions ) {
		return <QueryLocaleSuggestions />;
	}

	const localeSlug = getLocaleSlug();
	const usersOtherLocales = localeSuggestions.filter(
		( locale ) => ! ( localeSlug && localeSlug.startsWith( locale.locale ) )
	);

	if ( usersOtherLocales.length === 0 ) {
		return null;
	}

	const dismiss = () => setDismissed( true );

	return (
		<div className="locale-suggestions">
			<Notice icon="globe" showDismiss onDismissClick={ dismiss }>
				<div className="locale-suggestions__list">
					{ usersOtherLocales.map( ( locale ) => (
						<LocaleSuggestionsListItem
							key={ locale.locale }
							locale={ locale }
							onLocaleSuggestionClick={ dismiss }
							path={ addLocaleToPath( path, locale.locale ) }
						/>
					) ) }
				</div>
			</Notice>
		</div>
	);
}

LocaleSuggestions.propTypes = {
	path: PropTypes.string.isRequired,
	localeSuggestions: PropTypes.array,
};

export default connect( ( state ) => ( { localeSuggestions: getLocaleSuggestions( state ) } ) )(
	LocaleSuggestions
);
