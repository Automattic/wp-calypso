import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import Notice from '../../components/notice';
import type { AtomicEmailBlock, Site } from '@automattic/api-core';

/**
 * The site's outgoing email block, or `null` when the site can send. Read at
 * the call site so the notice never decides its own visibility.
 */
export function getEmailBlock( site: Site ): AtomicEmailBlock | null {
	return site.atomic_email_block?.status === 'blocked' ? site.atomic_email_block : null;
}

export function EmailBlockNotice( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const { setOpenOdieWithContext } = useHelpCenter();
	const hasRecordedImpression = useRef( false );

	// The arbiter only renders the winning candidate, so this counts notices
	// actually shown, not sites eligible to show one.
	useEffect( () => {
		if ( hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_dashboard_email_block_notice_impression', {
			site_id: site.ID,
		} );
	}, [ recordTracksEvent, site.ID ] );

	const handleContactClick = () => {
		recordTracksEvent( 'calypso_dashboard_email_block_notice_contact_click', {
			site_id: site.ID,
		} );
		setOpenOdieWithContext( {
			initialMessage: __( 'Outgoing email from my site is blocked.' ),
			section: 'site-overview',
			siteUrl: site.URL,
			siteId: site.ID,
		} );
	};

	return (
		<Notice
			variant="error"
			title={ __( 'Your site can’t send email' ) }
			actions={
				<Button variant="primary" onClick={ handleContactClick }>
					{ __( 'Contact us' ) }
				</Button>
			}
		>
			{ __(
				'Outgoing email from this site is blocked, so contact form messages, order confirmations, and password resets aren’t reaching their recipients. Contact us to get sending restored.'
			) }
		</Notice>
	);
}
