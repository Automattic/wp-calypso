import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { getEmailManagementPath, getMailboxesPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import type { UserData } from 'calypso/lib/user/user';

export type ThankYouEmailProductProps = {
	domainName: string;
	siteSlug: string | null;
	emailAddress: string;
};

export function ThankYouEmailProduct( {
	domainName,
	siteSlug,
	emailAddress,
}: ThankYouEmailProductProps ) {
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );
	const emailManagementPath = getEmailManagementPath( siteSlug, domainName, currentRoute );

	const mailboxesPath = getMailboxesPath( siteSlug );
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();
	const inboxPath = getTitanEmailUrl(
		titanAppsUrlPrefix,
		emailAddress,
		false,
		`${ window.location.protocol }//${ window.location.host }${ mailboxesPath }`
	);

	const user = useSelector( getCurrentUser ) as UserData;

	return (
		<ThankYouProduct
			name={ emailAddress }
			key={ emailAddress }
			details={ translate( 'User: %(username)s', { args: { username: user.display_name || '' } } ) }
			actions={
				<>
					<Button
						variant="primary"
						href={ inboxPath }
						onClick={ () => {
							recordEmailAppLaunchEvent( {
								provider: 'titan',
								app: 'webmail',
								context: 'checkout-thank-you',
							} );
						} }
					>
						{ translate( 'Go to inbox' ) }
					</Button>
					<Button variant="secondary" href={ emailManagementPath }>
						{ translate( 'Manage email' ) }
					</Button>
				</>
			}
			isLoading={ false }
		/>
	);
}
