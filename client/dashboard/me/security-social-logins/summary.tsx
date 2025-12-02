import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { commentAuthorAvatar } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecuritySocialLoginsSummary() {
	const { user } = useAuth();

	const socialLoginCount = user.social_login_connections?.length ?? 0;

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: socialLoginCount
				? sprintf(
						/* translators: %d is the number of social logins */
						_n( '%d social login', '%d social logins', socialLoginCount ),
						socialLoginCount
				  )
				: __( 'No social logins added' ),
			intent: socialLoginCount ? 'info' : 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/security/social-logins"
			title={ __( 'Social logins' ) }
			description={ __( 'Log in faster with the accounts you already use.' ) }
			decoration={ <Icon icon={ commentAuthorAvatar } /> }
			badges={ badges }
		/>
	);
}
