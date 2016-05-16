/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

export default {
	signup: {
		label: i18n.translate( 'Choose this design', {
			comment: 'when signing up for a WordPress.com account with a selected theme'
		} )
	},
	preview: {
		label: i18n.translate( 'Preview', {
			context: 'verb'
		} )
	},
	purchase: {
		label: i18n.translate( 'Purchase', {
			context: 'verb'
		} ),
		header: i18n.translate( 'Purchase on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to purchase a theme'
		} )
	},
	activate: {
		label: i18n.translate( 'Activate' ),
		header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
	},
	customize: {
		label: i18n.translate( 'Customize' ),
		header: i18n.translate( 'Customize on:', { comment: 'label for selecting a site for which to customize a theme' } ),
	},
	details: {
		label: i18n.translate( 'Details' ),
	},
	support: {
		label: i18n.translate( 'Setup' ),
	},
};
