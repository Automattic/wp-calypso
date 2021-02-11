/**
 * External dependencies
 */
import React from 'react';
import { useSelect } from '@wordpress/data';
import { WhatsNewState } from '@automattic/data-stores';

/**
 * Internal dependencies
 */

const WHATS_NEW_STORE = WhatsNewState.register();

function WhatsNew() {
	const whatsNewList = useSelect( ( select ) => select( WHATS_NEW_STORE ).getWhatsNewList() );
	return (
		<div>
			<div>{ JSON.stringify( whatsNewList ) }</div>
		</div>
	);
}

export default WhatsNew;
