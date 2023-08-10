import { isBulkDomainTransfer } from '../../utils';
import BulkDomainTransferFooter from './footer/BulkDomainTransferFooter';
import PlanFooter from './footer/PlanFooter';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Footer = ( { purchases }: { purchases: ReceiptPurchase[] } ) => {
	if ( isBulkDomainTransfer( purchases ) ) {
		return <BulkDomainTransferFooter />;
	}

	return <PlanFooter />;
};

export default Footer;
