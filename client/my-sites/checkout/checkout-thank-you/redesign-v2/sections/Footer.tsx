import { isP2Plus } from '@automattic/calypso-products';
import { isBulkDomainTransfer } from '../../utils';
import BulkDomainTransferFooter from './footer/BulkDomainTransferFooter';
import P2PlanFooter from './footer/P2PlanFooter';
import PlanFooter from './footer/PlanFooter';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Footer = ( { purchases }: { purchases: ReceiptPurchase[] } ) => {
	if ( isBulkDomainTransfer( purchases ) ) {
		return <BulkDomainTransferFooter />;
	}

	if ( purchases.some( isP2Plus ) ) {
		return <P2PlanFooter />;
	}

	return <PlanFooter />;
};

export default Footer;
