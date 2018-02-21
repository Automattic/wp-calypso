/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Preference from './Preference';

export default class PreferenceList extends Component {
	render() {
		return (
			<div>
				<a href={ '/devdocs/client/lib/preferences/README.md' } title="Preferences">
					Preferences
				</a>
				<Card className="preferences-helper__current-preferences">
					<Preference />
				</Card>
			</div>
		);
	}
}
