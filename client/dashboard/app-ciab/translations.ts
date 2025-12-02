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
			'Visit site ↗': __( 'Visit store ↗', ciabDomain ),
			'We guard your site. You run your business.': __(
				'We guard your store. You run your business.',
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
