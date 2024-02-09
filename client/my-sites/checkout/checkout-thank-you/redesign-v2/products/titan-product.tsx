import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import {
	getEmailManagementPath,
	getMailboxesPath,
	getTitanSetUpMailboxPath,
} from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export type ThankYouEmailProductProps = {
	domainName: string;
	siteSlug: string | null;
	emailAddress?: string;
};

export function ThankYouTitanProduct( {
	domainName,
	siteSlug,
	emailAddress,
}: ThankYouEmailProductProps ) {
	const translate = useTranslate();
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();

	const currentRoute = useSelector( getCurrentRoute );
	const emailManagementPath = getEmailManagementPath( siteSlug, domainName, currentRoute );

	const actions = [];
	if ( emailAddress ) {
		const mailboxesPath = getMailboxesPath( siteSlug );

		const inboxPath = getTitanEmailUrl(
			titanAppsUrlPrefix,
			emailAddress,
			false,
			`${ window.location.protocol }//${ window.location.host }${ mailboxesPath }`
		);

		actions.push(
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
		);

		actions.push(
			<Button variant="secondary" href={ emailManagementPath }>
				{ translate( 'Manage email' ) }
			</Button>
		);
	} else {
		actions.push(
			<Button href={ getTitanSetUpMailboxPath( siteSlug, domainName ) } variant="primary">
				{ translate( 'Set up mailbox' ) }
			</Button>
		);
	}

	const details =
		emailAddress ?? translate( 'Set up for %(domainName)s', { args: { domainName } } );

	return (
		<ThankYouProduct
			name={ translate( 'Professional Email' ) }
			key={ domainName + emailAddress }
			details={ details }
			actions={ actions }
			isLoading={ false }
		/>
	);
}
