/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getAllRemotePreferences } from 'calypso/state/preferences/selectors';
import QueryPreferences from 'calypso/components/data/query-preferences';
import Preference from './preference';

class PreferenceList extends Component {
	render() {
		const { preferences, translate } = this.props;

		const sortedPreferenceItems = preferences
			? Object.keys( preferences )
					.sort()
					.map( ( preferenceName ) => (
						<Preference
							key={ preferenceName }
							name={ preferenceName }
							value={ preferences[ preferenceName ] }
						/>
					) )
			: [];

		return (
			<>
				<QueryPreferences />
				<a href={ '/devdocs/client/state/preferences/README.md' }>{ translate( 'Preferences' ) }</a>
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
	}
}

export default connect(
	( state ) => ( {
		preferences: getAllRemotePreferences( state ),
	} ),
	null
)( localize( PreferenceList ) );
