import { translate } from 'i18n-calypso';
import { ThemesToolbarGroupItem } from 'calypso/my-sites/themes/themes-toolbar-group/types';

const STATIC_FILTERS: Record< string, ThemesToolbarGroupItem > = {
	MYTHEMES: {
		key: 'my-themes',
		text: translate( 'My Themes' ),
	},
	RECOMMENDED: {
		key: 'recommended',
		text: translate( 'Recommended' ),
	},
	ALL: {
		key: 'all',
		text: translate( 'All' ),
	},
};

export { STATIC_FILTERS };
