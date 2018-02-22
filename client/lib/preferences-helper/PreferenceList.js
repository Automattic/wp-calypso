/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial, isEmpty } from 'lodash';

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
					{ ! isEmpty( preferences ) ? (
						Object.keys( preferences ).map( prefName => (
							<div key={ prefName }>
								<div className="preferences-helper__preference-header">
									<button
										className="preferences-helper__unset"
										onClick={ partial( unsetPreference, prefName, null ) }
										title={ translate( 'Unset Preference' ) }
									>
										{ 'X' }
									</button>
									<span>{ prefName }</span>
								</div>
								<ul className="preferences-helper__list">
									{ Array.isArray( preferences[ prefName ] ) ? (
										preferences[ prefName ].map( ( preference, index ) => (
											<li key={ index }>{ preference }</li>
										) )
									) : (
										<li key={ 0 }>{ preferences[ prefName ].toString() }</li>
									) }
								</ul>
							</div>
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
