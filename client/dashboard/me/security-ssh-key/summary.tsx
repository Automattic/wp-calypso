import { sshKeysQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { formatNumber } from '@automattic/number-formatters';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type {
	Density,
	SummaryButtonBadgeProps,
} from '@automattic/components/src/summary-button/types';

export default function SecuritySshKeySummary( { density }: { density?: Density } ) {
	const { data: sshKeys } = useSuspenseQuery( sshKeysQuery() );
	const keyCount = sshKeys.length;

	if ( isEnabled( 'ssh-multiple-keys' ) ) {
		return (
			<RouterLinkSummaryButton
				density={ density }
				to="/me/security/ssh-key"
				title={ __( 'SSH keys' ) }
				description={ __(
					'Add SSH keys to your WordPress.com account to make them available for SFTP and SSH authentication.'
				) }
				decoration={ <Icon icon={ key } /> }
				badges={ [
					{
						text: keyCount
							? sprintf(
									/* translators: %s is the number of SSH keys. */
									_n( '%s SSH key', '%s SSH keys', keyCount ),
									formatNumber( keyCount )
								)
							: __( 'No SSH keys added' ),
						intent: keyCount ? 'stable' : 'draft',
					},
				] }
			/>
		);
	}

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: keyCount ? __( 'SSH key added' ) : __( 'No SSH key added' ),
			intent: keyCount ? 'stable' : 'draft',
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
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
