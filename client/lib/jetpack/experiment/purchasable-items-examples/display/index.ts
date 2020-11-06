/**
 * Internal dependencies
 */
import type {
	PurchaseableItem,
	PurchaseableItemDecorator,
} from 'calypso/lib/jetpack/experiment/purchaseable-items/types';
import { Products, Bundles } from 'calypso/lib/jetpack/experiment/purchaseable-items';
import BackupRealtime from './products/backup-realtime';
import SecurityDaily from './bundles/security-daily';
import type { DisplayableItem } from './types';

const itemMapping = {
	[ Products.BackupRealtimeAnnual.slug ]: BackupRealtime,
	[ Products.BackupRealtimeMonthly.slug ]: BackupRealtime,
	[ Bundles.SecurityDailyAnnual.slug ]: SecurityDaily,
	[ Bundles.SecurityDailyMonthly.slug ]: SecurityDaily,
};

export const withDisplayProperties: PurchaseableItemDecorator< DisplayableItem > = (
	item: PurchaseableItem
) => {
	return { ...item, ...itemMapping[ item.slug ] };
};
