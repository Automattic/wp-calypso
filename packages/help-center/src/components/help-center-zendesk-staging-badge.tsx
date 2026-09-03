import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { Icon, cautionFilled as warning } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

import './help-center-zendesk-staging-badge.scss';

export function ZendeskStagingBadge() {
	const { __ } = useI18n();

	if ( ! isTestModeEnvironment() ) {
		return null;
	}

	return (
		<span
			className="help-center-zendesk-staging-badge"
			title={ __(
				'Zendesk staging — chats here will not reach a real support agent.',
				__i18n_text_domain__
			) }
		>
			<Icon icon={ warning } size={ 14 } />
			{ __( 'Staging', __i18n_text_domain__ ) }
		</span>
	);
}
