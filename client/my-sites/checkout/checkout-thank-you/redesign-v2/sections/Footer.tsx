import { isP2Plus } from '@automattic/calypso-products';
import P2PlusPlanFooter from './footer/P2PlusPlanFooter';
import PlanFooter from './footer/PlanFooter';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Footer = ( { purchases }: { purchases: ReceiptPurchase[] } ) => {
	if ( purchases.some( isP2Plus ) ) {
		return <P2PlusPlanFooter />;
	}

	return <PlanFooter />;
};

export default Footer;
