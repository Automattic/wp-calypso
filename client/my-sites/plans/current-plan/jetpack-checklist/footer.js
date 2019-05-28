/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

const JetpackChecklistFooter = ( { translate, handleWpAdminLink, wpAdminUrl } ) => (
	<Card compact className="jetpack-checklist__footer">
		<p>{ translate( 'Return to your self-hosted WordPress dashboard.' ) }</p>
		<Button
			compact
			data-tip-target="jetpack-checklist-wpadmin-link"
			href={ wpAdminUrl }
			onClick={ handleWpAdminLink }
		>
			{ translate( 'Return to WP Admin' ) }
		</Button>
	</Card>
);

export default localize( JetpackChecklistFooter );
