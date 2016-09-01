/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DismissableCard from '../';
import QueryPreferences from 'components/data/query-preferences';
import { savePreference } from 'state/preferences/actions';

function DismissableCardExample( { clearPreference } ) {
	return (
		<div className="docs__design-assets-group">
			<QueryPreferences />
			<h2>
				<a href="/devdocs/blocks/dissmissable-card">Dismissable Card</a>
			</h2>
			<DismissableCard
				preferenceName="example-local"
				temporary>
				<span>I will be dismissed for a page load</span>
			</DismissableCard>
			<DismissableCard
				preferenceName="example"
			>
				<span>I can be dismissed forever!</span>
			</DismissableCard>
			<Button onClick={ clearPreference }>Reset Dismiss Preference</Button>
		</div>
	);
}

const ConnectedDismissableCardExample = connect( 
	( state ) => { return {}; },
	( dispatch ) => bindActionCreators( {
		clearPreference: () => {
			return savePreference( 'dismissable-card-example', null );
		}
	}, dispatch )
)( DismissableCardExample );

ConnectedDismissableCardExample.displayName = 'DismissableCard';

export default ConnectedDismissableCardExample;
