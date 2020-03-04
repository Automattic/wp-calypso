/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { translate } from 'i18n-calypso';

// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_JETPACK_SEARCH_TRIAL = 'jetpack_search_trial';

// Backup Products

export const JETPACK_BACKUP_PRODUCTS_YEARLY = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = [
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

export const JETPACK_BACKUP_PRODUCT_SHORT_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Daily Backups' ),
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Daily Backups' ),
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Real-Time Backups' ),
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate( 'Real-Time Backups' ),
};

export const JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME = (
	<Fragment>
		{ translate( 'Jetpack Backup {{em}}Daily{{/em}}', {
			components: {
				em: <em />,
			},
		} ) }
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME = (
	<Fragment>
		{ translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', {
			components: {
				em: <em />,
			},
		} ) }
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
};

export const JETPACK_BACKUP_PRODUCT_DAILY_TAGLINE = translate(
	'Your data is being securely backed up every day with a 30-day archive.'
);
export const JETPACK_BACKUP_PRODUCT_REALTIME_TAGLINE = translate(
	'Your data is being securely backed up as you edit.'
);

export const JETPACK_BACKUP_PRODUCT_TAGLINES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: JETPACK_BACKUP_PRODUCT_DAILY_TAGLINE,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: JETPACK_BACKUP_PRODUCT_DAILY_TAGLINE,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: JETPACK_BACKUP_PRODUCT_REALTIME_TAGLINE,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: JETPACK_BACKUP_PRODUCT_REALTIME_TAGLINE,
};

export const PRODUCT_JETPACK_BACKUP_DESCRIPTION = translate(
	'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.'
);
export const PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION = translate(
	'Always-on backups ensure you never lose your site. Your changes are saved every day with a 30-day archive.'
);
export const PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION = translate(
	'Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives.'
);

export const JETPACK_BACKUP_PRODUCT_DESCRIPTIONS = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
};

export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';

// Search Products

export const JETPACK_SEARCH_PRODUCT_SHORT_NAMES = {
	[ PRODUCT_JETPACK_SEARCH ]: translate( 'Search' ),
	[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
	[ PRODUCT_JETPACK_SEARCH_TRIAL ]: translate( 'Search (Trial)' ),
};

export const JETPACK_SEARCH_PRODUCTS = [
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SEARCH_TRIAL,
];

//TODO: add the rest of the search constants

// All Products

export const JETPACK_PRODUCTS_LIST = [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SEARCH_PRODUCTS ];

export const PRODUCT_SHORT_NAMES = {
	...JETPACK_BACKUP_PRODUCT_SHORT_NAMES,
	...JETPACK_SEARCH_PRODUCT_SHORT_NAMES,
};

export const JETPACK_PRODUCT_DISPLAY_NAMES = {
	...JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES,
	//...JETPACK_SEARCH_PRODUCT_DISPLAY_NAMES,
};

export const JETPACK_PRODUCT_TAGLINES = {
	...JETPACK_BACKUP_PRODUCT_TAGLINES,
	//...JETPACK_SEARCH_PRODUCT_TAGLINES,
};

export const JETPACK_PRODUCT_PRICE_MATRIX = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SEARCH ]: {
		relatedProduct: PRODUCT_JETPACK_SEARCH_MONTHLY,
		ratio: 12,
	},
};

export const JETPACK_PRODUCTS = [
	{
		title: translate( 'Jetpack Backup' ),
		description: PRODUCT_JETPACK_BACKUP_DESCRIPTION,
		id: PRODUCT_JETPACK_BACKUP,
		options: {
			yearly: JETPACK_BACKUP_PRODUCTS_YEARLY,
			monthly: JETPACK_BACKUP_PRODUCTS_MONTHLY,
		},
		optionShortNames: {
			...JETPACK_BACKUP_PRODUCT_SHORT_NAMES,
		},
		optionDisplayNames: {
			...JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES,
		},
		optionDescriptions: {
			...JETPACK_BACKUP_PRODUCT_DESCRIPTIONS,
		},
		optionsLabel: translate( 'Select a backup option:' ),
	},
	//{
	//	title: translate( 'Jetpack Search' ),
	//	description: PRODUCT_JETPACK_SEARCH_DESCRIPTION,
	//	id: PRODUCT_JETPACK_SEARCH,
	//	options: {
	//		yearly: JETPACK_SEARCH,
	//		monthly: JETPACK_SEARCH_MONTHLY,
	//	},
	//	optionShortNames: {
	//		...JETPACK_SEARCH_PRODUCT_SHORT_NAMES,
	//	},
	//	optionDisplayNames: {
	//		...JETPACK_SEARCH_PRODUCT_DISPLAY_NAMES,
	//	},
	//	optionDescriptions: {
	//		...JETPACK_SEARCH_PRODUCT_DESCRIPTIONS,
	//	},
	//	optionsLabel: translate( 'Select a backup option:' ),
	//},
];
