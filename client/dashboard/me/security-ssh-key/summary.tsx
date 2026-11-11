import { sshKeysQuery } from '@automattic/api-queries';
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

function getBadgeText( keyCount: number ) {
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
	const badges: SummaryButtonBadgeProps[] = [
		{
			text: getBadgeText( keyCount ),
			intent: keyCount ? 'stable' : 'draft',
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/security/ssh-key"
			title={ __( 'SSH keys' ) }
			description={ __(
				'Add SSH keys to your WordPress.com account to make them available for SFTP and SSH authentication.'
			) }
			decoration={ <Icon icon={ key } /> }
			badges={ badges }
		/>
	);
}
