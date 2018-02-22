/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getAllRemotePreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';

class PreferenceList extends Component {
	render() {
		const { preferences, translate, unsetPreference } = this.props;
		return (
			<div>
				<a
					href={ '/devdocs/client/state/preferences/README.md' }
					title={ translate( 'Preferences' ) }
				>
					{ translate( 'Preferences' ) }
				</a>
				<Card className="preferences-helper__current-preferences">
					{ preferences &&
						Object.keys( preferences ).map( prefName => (
							<div key={ prefName }>
								<h5 className="preferences-helper__preference-header">{ prefName }</h5>
								<span className="preferences-helper__value-label">
									{ translate( 'Value: ' ) }
								</span>
								<span className="preferences-helper__value">
									{ preferences[ prefName ].toString() }
								</span>
								<button
									className="preferences-helper__unset"
									onClick={ partial( unsetPreference, prefName, null ) }
								>
									{ translate( 'Unset' ) }
								</button>
						</div>
						) ) }
				</Card>
			</div>
		);
	}
}

export default connect(
	state => {
		const preferences = getAllRemotePreferences( state );
		return {
			preferences,
		};
	},
	{
		unsetPreference: savePreference,
	}
)( localize( PreferenceList ) );
