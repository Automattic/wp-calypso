/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import DismissibleCard from '../';
import { savePreference } from 'calypso/state/preferences/actions';

function DismissibleCardExample() {
	const dispatch = useDispatch();

	function clearPreference() {
		dispatch( savePreference( 'dismissible-card-example', null ) );
	}

	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/dismissible-card">Dismissible Card</a>
			</h2>
			<DismissibleCard preferenceName="example-local" temporary>
				<span>I will be dismissed for a page load</span>
			</DismissibleCard>
			<DismissibleCard preferenceName="example">
				<span>I can be dismissed forever!</span>
			</DismissibleCard>
			<Button onClick={ clearPreference }>Reset Dismiss Preference</Button>
		</div>
	);
}

DismissibleCardExample.displayName = 'DismissibleCard';

export default DismissibleCardExample;
