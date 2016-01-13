/**
 * External dependencies
 */
import titleCase from 'to-title-case';
import assign from 'lodash/object/assign';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import Helper from 'lib/themes/helpers';

export default function getButtonOptions( site, theme, isLoggedOut, actions, setSelectedTheme, togglePreview, showAll = false ) {
	return rawOptions( site, theme, isLoggedOut )
		.filter( option => showAll || ! option.isHidden )
		.map( appendAction );

	function appendAction( option ) {
		const { hasAction, name } = option;

		if ( ! hasAction ) {
			return option;
		}

		let action;
		if ( name === 'preview' ) {
			action = togglePreview.bind( null, theme );
		} else if ( site ) {
			action = actions[ name ].bind( actions, theme, site, 'showcase' );
		} else {
			action = setSelectedTheme.bind( null, name, theme );
		}

		return assign( {}, option, {
			action: trackedAction( action, name )
		} );
	}

	function trackedAction( action, name ) {
		return () => {
			action();
			Helper.trackClick( 'more button', name );
		};
	}
};

function rawOptions( theme, isLoggedOut ) {
	return [
		{
			name: 'signup',
			label: i18n.translate( 'Choose this design', {
				comment: 'when signing up for a WordPress.com account with a selected theme'
			} ),
			getUrl: () => Helper.getSignupUrl( theme ),
			isHidden: () => ! isLoggedOut
		},
		{
			name: 'preview',
			label: i18n.translate( 'Preview', {
				context: 'verb'
			} ),
			header: i18n.translate( 'Preview on:', {
				context: 'verb',
				comment: 'label for selecting a site on which to preview a theme'
			} ),
			hasAction: true,
			isHidden: () => theme.active
		},
		{
			name: 'purchase',
			label: i18n.translate( 'Purchase', {
				context: 'verb'
			} ),
			header: i18n.translate( 'Purchase on:', {
				context: 'verb',
				comment: 'label for selecting a site for which to purchase a theme'
			} ),
			hasAction: true,
			isHidden: () => isLoggedOut || theme.active || theme.purchased || ! theme.price
		},
		{
			name: 'activate',
			label: i18n.translate( 'Activate' ),
			header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
			hasAction: true,
			isHidden: () => isLoggedOut || theme.active || ( theme.price && ! theme.purchased )
		},
		{
			name: 'customize',
			label: i18n.translate( 'Customize' ),
			header: i18n.translate( 'Customize on:', { comment: 'label for selecting a site for which to customize a theme' } ),
			hasAction: true,
			isHidden: site => ! theme.active || ( site && ! site.isCustomizable() )
		},
		{
			separator: true
		},
		{
			name: 'details',
			label: i18n.translate( 'Details' ),
			getUrl: site => Helper.getDetailsUrl( theme, site )
		},
		{
			name: 'support',
			label: i18n.translate( 'Support' ),
			getUrl: site => Helper.getSupportUrl( theme, site ),
			isHidden: site => site && site.jetpack // We don't know where support docs for a given theme on a self-hosted WP install are.
		},
	];
}
