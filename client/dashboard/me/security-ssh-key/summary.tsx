import { sshKeysQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecuritySshKeySummary() {
	const { data: sshKeys } = useSuspenseQuery( sshKeysQuery() );

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: sshKeys.length ? __( 'SSH key added' ) : __( 'No SSH key added' ),
			intent: sshKeys.length ? 'success' : 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/security/ssh-key"
			title={ __( 'SSH key' ) }
			description={ __(
				'Add a SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
			) }
			decoration={ <Icon icon={ key } /> }
			badges={ badges }
		/>
	);
}
