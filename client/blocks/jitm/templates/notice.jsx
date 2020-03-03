/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export default function NoticeTemplate( { icon, CTA, message, onClick, onDismiss, trackImpression } ) {
	return (
		<Notice
			isCompact
			status="is-success"
			icon={ icon || "info-outline" }
			onDismissClick={ onDismiss }
			showDismiss={ ! CTA && ! CTA.message }
			text={ message }
		>
			{ CTA && CTA.message && (
				<NoticeAction href={ CTA.link } onClick={ onClick }>
					{ CTA.message }
					{ trackImpression && trackImpression() }
				</NoticeAction>
			) }
		</Notice>
	);
}
