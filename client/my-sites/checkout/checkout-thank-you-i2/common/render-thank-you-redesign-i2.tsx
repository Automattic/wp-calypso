import { isBusiness } from '@automattic/calypso-products';
import { ReceiptPurchase } from 'calypso/state/receipts/types';
import ThankYouRedesignI2 from '..';

export const shouldRenderThankYouRedesignI2 = ( purchases: ReceiptPurchase[] ) => {
	for ( const purchase of purchases ) {
		switch ( true ) {
			case isBusiness( purchase ):
				return true;
		}
	}
	return false;
};

export const renderThankYouRedesignI2 = () => {
	return <ThankYouRedesignI2 />;
};
