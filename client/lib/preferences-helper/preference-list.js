/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getAllRemotePreferences } from 'state/preferences/selectors';
import QueryPreferences from 'components/data/query-preferences';
import Preference from './preference';

class PreferenceList extends Component {
	render() {
		const { preferences, translate } = this.props;
		return (
			<div>
				<QueryPreferences />
				<a
					href={ '/devdocs/client/state/preferences/README.md' }
					title={ translate( 'Preferences' ) }
				>
					{ translate( 'Preferences' ) }
				</a>
				<Card className="preferences-helper__current-preferences">
					{ ! isEmpty( preferences ) ? (
						Object.keys( preferences ).map( preferenceName => (
							<Preference
								key={ preferenceName }
								name={ preferenceName }
								value={ preferences[ preferenceName ] }
							/>
						) )
					) : (
						<h5 className="preferences-helper__preference-header">
							{ translate( 'No Preferences' ) }
						</h5>
					) }
				</Card>
			</div>
		);
	}
}

export default connect(
	state => ( {
		preferences: getAllRemotePreferences( state ),
	} ),
	null
)( localize( PreferenceList ) );
