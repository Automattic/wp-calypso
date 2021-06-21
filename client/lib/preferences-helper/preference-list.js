/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';
import QueryPreferences from 'calypso/components/data/query-preferences';
import Preference from './preference';

const PreferenceList = () => {
	const translate = useTranslate();

	const preferences = useSelector( getAllRemotePreferences );
	const sortedPreferenceItems = useMemo( () => {
		if ( ! preferences ) {
			return [];
		}

		return Object.keys( preferences )
			.sort()
			.map( ( preferenceName ) => (
				<Preference
					key={ preferenceName }
					name={ preferenceName }
					value={ preferences[ preferenceName ] }
				/>
			) );
	}, [ preferences ] );

	return (
		<>
			<QueryPreferences />
			<a
				href={ '/devdocs/client/state/preferences/README.md' }
				title={ translate( 'Preferences' ) }
			>
				{ translate( 'Preferences' ) }
			</a>
			<Card className="preferences-helper__current-preferences">
				{ sortedPreferenceItems.length > 0 ? (
					<table className="preferences-helper__preferences-table">
						<thead>
							<tr>
								<th className="preferences-helper__header-unset">{ translate( 'Delete' ) }</th>
								<th className="preferences-helper__header-name">{ translate( 'Name' ) }</th>
								<th className="preferences-helper__header-value">{ translate( 'Value(s)' ) }</th>
							</tr>
						</thead>
						<tbody>{ sortedPreferenceItems }</tbody>
					</table>
				) : (
					<h5 className="preferences-helper__no-preferences">
						{ translate( 'No preferences are currently set' ) }
					</h5>
				) }
			</Card>
		</>
	);
};

export default PreferenceList;
