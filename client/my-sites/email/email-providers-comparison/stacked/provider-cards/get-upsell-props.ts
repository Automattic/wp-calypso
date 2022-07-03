import { translate } from 'i18n-calypso';
import page from 'page';
import type { MailboxListProps } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';

const getUpsellProps = ( {
	isDomainInCart,
	siteSlug,
}: {
	isDomainInCart: boolean;
	siteSlug: string;
} ): Partial< MailboxListProps > =>
	! isDomainInCart
		? {}
		: {
				cancelActionText: translate( 'Skip' ),
				onCancel: () => page( `/checkout/${ siteSlug }` ),
				showCancelButton: true,
		  };

export default getUpsellProps;
