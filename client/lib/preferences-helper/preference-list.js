import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';
import Preference from './preference';

function getPreferenceEntries( preferences ) {
	if ( ! preferences ) {
		return null;
	}

	const entries = Object.entries( preferences );
	if ( entries.length === 0 ) {
		return null;
	}

	return entries;
}

export default function PreferenceList() {
	const translate = useTranslate();
	const preferences = useSelector( getAllRemotePreferences );
	const preferenceEntries = useMemo( () => getPreferenceEntries( preferences ), [ preferences ] );
	return (
		<div>
			<QueryPreferences />
			<a href="/devdocs/client/state/preferences/README.md" title={ translate( 'Preferences' ) }>
				{ translate( 'Preferences' ) }
			</a>
			<div className="preferences-helper__current-preferences">
				{ preferenceEntries ? (
					preferenceEntries.map( ( [ name, value ] ) => (
						<Preference key={ name } name={ name } value={ value } />
					) )
				) : (
					<h5 className="preferences-helper__preference-header">
						{ translate( 'No Preferences' ) }
					</h5>
				) }
			</div>
		</div>
	);
}
