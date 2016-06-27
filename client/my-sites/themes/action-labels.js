/** @ssr-ready **/

/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export default {
	signup: {
		label: i18n.translate( 'Pick this design', {
			comment: 'when signing up for a WordPress.com account with a selected theme'
		} )
	},
	preview: {
		label: i18n.translate( 'Live demo', {
			comment: 'label for previewing the theme demo website'
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
		header: i18n.translate( 'Customize on:', { comment: 'label in the dialog for selecting a site for which to customize a theme' } ),
	},
	tryandcustomize: {
		label: i18n.translate( 'Try & Customize' ),
		header: i18n.translate( 'Try & Customize on:', { comment: 'label in the dialog for opening the Customizer with the theme in preview' } ),
	},
	details: {
		label: i18n.translate( 'Details' ),
	},
	support: {
		label: i18n.translate( 'Setup' ),
	},
	help: {
		label: i18n.translate( 'Support' ),
	},
};
