/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';

function SuccessBanner( {
	moment,
	timestamp,
	translate,
} ) {
	// FIXME: real dismiss
	const handleDismiss = () => {};

	return (
		<ActivityLogBanner
			isDismissable
			onDismissClick={ handleDismiss }
			status="success"
			title={ translate( 'Your site has been successfully restored' ) }
		>
			<p>{ translate(
				'We successfully restored your site back to %s!',
				{ args: moment( timestamp ).format( 'LLLL' ) }
			) }</p>
			<Button primary>
				{ translate( 'View site' ) }
			</Button>
			{ '  ' }
			<Button onClick={ handleDismiss }>
				{ translate( 'Thanks, got it!' ) }
			</Button>
		</ActivityLogBanner>
	);
}

export default localize( SuccessBanner );
