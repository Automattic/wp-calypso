import { translate } from 'i18n-calypso';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';
import type { TranslateResult } from 'i18n-calypso';

export const STORAGE_ESTIMATION_ADDITIONAL_BUFFER = 0.25;

export const STORAGE_RETENTION_LEARN_MORE_LINK =
	'https://jetpack.com/support/backup/#how-is-storage-usage-calculated';

export const RETENTION_OPTIONS_LABELS: Record< RetentionPeriod, TranslateResult > = {
	[ 7 ]: translate( '7 days' ),
	[ 30 ]: translate( '30 days' ),
	[ 120 ]: translate( '120 days' ),
	[ 365 ]: translate( '1 year' ),
};
