/**
 * External dependencies
 */
import React from 'react';
import { useSelect } from '@wordpress/data';
import { WhatsNewState } from '@automattic/data-stores';
import Card from '@automattic/components';

/**
 * Internal dependencies
 */

const WHATS_NEW_STORE = WhatsNewState.register();

function WhatsNew() {
	const whatsNewList = useSelect( ( select ) => select( WHATS_NEW_STORE ).getWhatsNewList() );
	return (
		<Card>
			<div>{ JSON.stringify( whatsNewList ) }</div>
		</Card>
	);
}

export default WhatsNew;
