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

function ActivityLogErrorBanner( {
	translate,
} ) {
	return (
		<ActivityLogBanner
			isDismissable
			onDismissClick={ /* FIXME */ function() {} }
			status="is-error"
			title={ translate( 'Problem restoring your site' ) }
		>
			<p>{ translate( 'We came across a problem while trying to restore your site.' ) }</p>
			<Button primary >
				{ translate( 'Try again' ) }
			</Button>
			{ '  ' }
			<Button>
				{ translate( 'Get help' ) }
			</Button>
		</ActivityLogBanner>
	);
}

export default localize( ActivityLogErrorBanner );
