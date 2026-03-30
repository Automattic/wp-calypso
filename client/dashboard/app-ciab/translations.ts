import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const ciabDomain = 'Commerce in a box';

let translations: Record< string, string > | null;

const ciabGetTranslations = ( translation: string, text: string ) => {
	if ( ! translations ) {
		translations = {
			'Add new site': __( 'Add new store', ciabDomain ),
			'Anyone can view your site.': __( 'Anyone can view your store.', ciabDomain ),
			'Bring your site to WordPress.com.': __( 'Bring your store to WordPress.com.', ciabDomain ),
			'Choose between a visual grid view and a more compact table view of your sites.': __(
				'Choose between a visual grid view and a more compact table view of your stores.',
				ciabDomain
			),
			'Choose which site properties you see as well as sorting, density, and the number of sites displayed on each page.':
				__(
					'Choose which store properties you see as well as sorting, density, and the number of stores displayed on each page.',
					ciabDomain
				),
			'Edit site ↗': __( 'Edit store ↗', ciabDomain ),
			'Import site ↗': __( 'Import store ↗', ciabDomain ),
			'Leave site': __( 'Leave store', ciabDomain ),
			'Migrate site': __( 'Migrate store', ciabDomain ),
			Site: __( 'Store', ciabDomain ),
			Sites: __( 'Stores', ciabDomain ),
			Public: __( 'Live', ciabDomain ),
			'Visit site ↗': __( 'Visit store ↗', ciabDomain ),
			'We guard your site. You run your business.': __(
				'We guard your store. You run your business.',
				ciabDomain
			),
			'Delete site': __( 'Delete store', ciabDomain ),
			'Unable to delete site': __( 'Unable to delete store', ciabDomain ),
			"Delete all your posts, pages, media, and data, and give up your site's address.": __(
				"Delete all your products, orders, media, and data, and give up your store's address.",
				ciabDomain
			),
			'Delete your site permanently': __( 'Delete your store permanently', ciabDomain ),
			'Confirm delete site': __( 'Confirm delete store', ciabDomain ),
			'Confirm site deletion': __( 'Confirm store deletion', ciabDomain ),
			'Permanently delete your site and all of its content. {{learnMoreLink}}Learn more{{/learnMoreLink}}.':
				__(
					'Permanently delete your store and all of its content. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					ciabDomain
				),
			'Deletion is {{strong}}irreversible and will permanently remove all site content{{/strong}} — posts, pages, media, users, authors, domains, purchased upgrades, and premium themes.':
				__(
					'Deletion is {{strong}}irreversible and will permanently remove all store content{{/strong}} — products, orders, media, users, domains, purchased upgrades, and premium themes.',
					ciabDomain
				),
			'Type {{strong}}%(siteDomain)s{{/strong}} below to confirm you want to delete the site:':
				/* translators: %(siteDomain)s: site domain the user must type to confirm deletion */
				__(
					'Type {{strong}}%(siteDomain)s{{/strong}} below to confirm you want to delete the store:',
					ciabDomain
				),
			'Before deleting your site, consider exporting your content as a backup.': __(
				'Before deleting your store, consider exporting your products and orders as a backup.',
				ciabDomain
			),
			'Deletion is irreversible and will permanently remove all site content — posts, pages, media, users, authors, domains, purchased upgrades, and premium themes.':
				__(
					'Deletion is irreversible and will permanently remove all store content — products, orders, media, users, domains, purchased upgrades, and premium themes.',
					ciabDomain
				),
			'Failed to delete site': __( 'Failed to delete store', ciabDomain ),
			'Type the site domain to confirm': __( 'Type the store domain to confirm', ciabDomain ),
			'The site domain is: %s':
				/* translators: %s: domain to confirm store deletion */
				__( 'The store domain is: %s', ciabDomain ),
			'You have an active or expired free trial on your site. Please cancel this plan prior to deleting your site.':
				__(
					'You have an active or expired free trial on your store. Please cancel this plan prior to deleting your store.',
					ciabDomain
				),
			'You have active paid upgrades on your site. Please cancel your upgrades prior to deleting your site.':
				__(
					'You have active paid upgrades on your store. Please cancel your upgrades prior to deleting your store.',
					ciabDomain
				),
			'Before deleting your site, consider <link>exporting your content as a backup</link>.': __(
				'Before deleting your store, consider <link>exporting your products and orders as a backup</link>.',
				ciabDomain
			),
		};
	}

	return translations[ text ] ?? translation;
};

const i18nGettextCallback = ( translation: string, text: string, domain: string ) => {
	// The hook is for text that doesn’t belong to the Commerce in a Box domain.
	if ( domain === ciabDomain ) {
		return translation;
	}
	return ciabGetTranslations( translation, text );
};

const i18nNgettextCallback = (
	translation: string,
	single: string,
	plural: string,
	number: number,
	domain: string
) => {
	// The hook is for text that doesn’t belong to the Commerce in a Box domain.
	if ( domain === ciabDomain ) {
		return translation;
	}

	return ciabGetTranslations( translation, number ? plural : single );
};

addFilter( 'i18n.gettext', 'app-ciab/override-gettext', i18nGettextCallback );
addFilter( 'i18n.ngettext', 'app-ciab/override-ngettext', i18nNgettextCallback );
