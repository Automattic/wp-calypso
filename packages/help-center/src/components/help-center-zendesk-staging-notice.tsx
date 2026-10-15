import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { Icon, cautionFilled as warning, close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import './help-center-zendesk-staging-notice.scss';

const DISMISSED_STORAGE_KEY = 'help-center-zendesk-staging-notice-dismissed';

function readDismissed(): boolean {
	try {
		return window.localStorage.getItem( DISMISSED_STORAGE_KEY ) === 'true';
	} catch {
		return false;
	}
}

function persistDismissed() {
	try {
		window.localStorage.setItem( DISMISSED_STORAGE_KEY, 'true' );
	} catch {
		// Storage may be unavailable (e.g. private browsing); dismissal just won't persist.
	}
}

export function ZendeskStagingNotice() {
	const { __ } = useI18n();
	const { pathname } = useLocation();
	const [ isDismissed, setIsDismissed ] = useState( readDismissed );

	const isOdieRoute = pathname.startsWith( '/odie' );

	if ( ! isOdieRoute || ! isTestModeEnvironment() || isDismissed ) {
		return null;
	}

	return (
		<div className="help-center-zendesk-staging-notice">
			<Icon icon={ warning } className="help-center-zendesk-staging-notice__icon" />
			<p>
				<strong>{ __( 'You’re on Zendesk staging', __i18n_text_domain__ ) }</strong>{ ' ' }
				{ __(
					'Conversations here are for testing and will never reach a real support agent. To test the production experience, use a production environment.',
					__i18n_text_domain__
				) }
			</p>
			<Button
				className="help-center-zendesk-staging-notice__dismiss"
				icon={ close }
				label={ __( 'Dismiss', __i18n_text_domain__ ) }
				onClick={ () => {
					persistDismissed();
					setIsDismissed( true );
				} }
			/>
		</div>
	);
}
