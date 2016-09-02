/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DismissableCard from '../';
import { savePreference } from 'state/preferences/actions';

function DismissableCardExample( { clearPreference } ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/dismissable-card">Dismissable Card</a>
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
	null,
	{ clearPreference: partial( savePreference, 'dismissable-card-example', null ) }
)( DismissableCardExample );

ConnectedDismissableCardExample.displayName = 'DismissableCard';

export default ConnectedDismissableCardExample;
