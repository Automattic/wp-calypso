import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Purchase } from 'calypso/lib/purchases/types';

function PurchaseMetaEndDate( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dateSpan = <span className="manage-purchase__detail-date-span" />;

	const subsEndDateText = translate( 'Paid through {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
		args: {
			expireDate: moment( purchase.expiryDate ).format( 'LL' ),
		},
		components: {
			dateSpan,
		},
	} );

	return <span>{ subsEndDateText }</span>;
}

export default PurchaseMetaEndDate;
