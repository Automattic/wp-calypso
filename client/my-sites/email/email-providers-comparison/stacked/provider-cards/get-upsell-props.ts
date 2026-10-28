import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import type { MailboxListProps } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';

const getUpsellProps = ( {
	isDomainInCart,
	siteSlug,
	canSkip = true,
}: {
	isDomainInCart: boolean;
	siteSlug: string;
	canSkip?: boolean;
} ): Partial< MailboxListProps > =>
	! isDomainInCart || ! canSkip
		? {}
		: {
				cancelActionText: translate( 'Skip' ),
				onCancel: () => page( `/checkout/${ siteSlug }` ),
				showCancelButton: true,
			};

export default getUpsellProps;
