/**
 * Internal dependencies
 */
import type {
	PurchasableItem,
	PurchasableItemDecorator,
} from 'calypso/lib/jetpack/experiment/purchasable-items/types';
import { Products, Bundles } from 'calypso/lib/jetpack/experiment/purchasable-items';
import BackupRealtime from './products/backup-realtime';
import SecurityDaily from './bundles/security-daily';
import type { DisplayableItem } from './types';

const itemMapping = {
	[ Products.BackupRealtimeAnnual.slug ]: BackupRealtime,
	[ Products.BackupRealtimeMonthly.slug ]: BackupRealtime,
	[ Bundles.SecurityDailyAnnual.slug ]: SecurityDaily,
	[ Bundles.SecurityDailyMonthly.slug ]: SecurityDaily,
};

export const withDisplayProperties: PurchasableItemDecorator< DisplayableItem > = (
	item: PurchasableItem
) => {
	return { ...item, ...itemMapping[ item.slug ] };
};
