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
	numberOfMailboxesPurchased?: number;
};

export function ThankYouTitanProduct( {
	domainName,
	siteSlug,
	emailAddress,
	numberOfMailboxesPurchased,
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
				key="inbox"
				variant="primary"
				target="_blank"
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
			<Button key="manage-mail" variant="secondary" href={ emailManagementPath }>
				{ translate( 'Manage email' ) }
			</Button>
		);
	} else {
		actions.push(
			<Button
				key="set-up-mailbox"
				href={ getTitanSetUpMailboxPath( siteSlug, domainName ) }
				variant="primary"
			>
				{ translate( 'Set up mailbox' ) }
			</Button>
		);
	}

	let details;
	if ( numberOfMailboxesPurchased && numberOfMailboxesPurchased > 1 ) {
		details = translate( '%(quantity)s mailboxes for %(domainName)s', {
			args: { quantity: numberOfMailboxesPurchased, domainName },
		} );
	} else if ( ! emailAddress ) {
		details = translate( 'Set up your mailbox for %(domainName)s', { args: { domainName } } );
	} else {
		details = emailAddress;
	}

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
