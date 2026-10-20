import './unread-indicator.style.scss';

import { Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function UnreadIndicator() {
	return (
		<Tooltip text={ __( 'Unread' ) }>
			<span
				className="reader-post-card__unread-indicator"
				role="img"
				aria-label={ __( 'Unread' ) }
				// Tooltip makes its anchor tabbable; keep the dot out of the tab order.
				tabIndex={ -1 }
			/>
		</Tooltip>
	);
}
