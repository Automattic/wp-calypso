/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './activity-log-banner';
import Button from 'components/button';

function ActivityLogSuccessBanner( {
	translate,
	moment,
} ) {
	// FIXME: real dates
	const date = 1496400468285;
	// FIXME: real dismiss
	const handleDismiss = () => {};

	return (
		<ActivityLogBanner
			isDismissable
			onDismissClick={ handleDismiss }
			status="is-success"
			title={ translate( 'Your site has been successfully restored' ) }
		>
			<p>{ translate(
				'We successfully restored your site back to %s!',
				{ args: moment( date ).format( 'LLLL' ) }
			) }</p>
			<Button primary >
				{ translate( 'View site' ) }
			</Button>
			{ '  ' }
			<Button onClick={ handleDismiss }>
				{ translate( 'Thanks, got it!' ) }
			</Button>
		</ActivityLogBanner>
	);
}

export default localize( ActivityLogSuccessBanner );
