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

function getMultipleKeysBadgeText( keyCount: number ) {
	if ( ! keyCount ) {
		return __( 'No SSH keys added' );
	}
	return sprintf(
		/* translators: %s is the number of SSH keys. */
		_n( '%s SSH key', '%s SSH keys', keyCount ),
		formatNumber( keyCount )
	);
}

export default function SecuritySshKeySummary( { density }: { density?: Density } ) {
	const { data: sshKeys } = useSuspenseQuery( sshKeysQuery() );
	const keyCount = sshKeys.length;
	const isMultipleKeysEnabled = isEnabled( 'ssh-multiple-keys' );

	let badgeText: string = keyCount ? __( 'SSH key added' ) : __( 'No SSH key added' );
	if ( isMultipleKeysEnabled ) {
		badgeText = getMultipleKeysBadgeText( keyCount );
	}

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: badgeText,
			intent: keyCount ? 'stable' : 'draft',
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/security/ssh-key"
			title={ isMultipleKeysEnabled ? __( 'SSH keys' ) : __( 'SSH key' ) }
			description={
				isMultipleKeysEnabled
					? __(
							'Add SSH keys to your WordPress.com account to make them available for SFTP and SSH authentication.'
						)
					: __(
							'Add a SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
						)
			}
			decoration={ <Icon icon={ key } /> }
			badges={ badges }
		/>
	);
}
