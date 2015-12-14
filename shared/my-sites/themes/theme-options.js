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

export default function getButtonOptions( site, theme, actions, setSelectedTheme, togglePreview, showAll = false ) {
	return rawOptions( site, theme )
		.filter( option => showAll || ! option.hideIf )
		.map( appendUrl )
		.map( appendAction );

	function appendUrl( option ) {
		const { hasUrl, name } = option;

		if ( ! hasUrl ) {
			return option;
		}

		const methodName = `get${ titleCase( name ) }Url`;
		const getUrl = Helper[ methodName ];

		return assign( {}, option, {
			url: getUrl( theme, site )
		} );
	}

	function appendAction( option ) {
		const { hasAction, name } = option;

		if ( ! hasAction ) {
			return option;
		}

		let action;
		if ( name === 'preview' ) {
			action = togglePreview.bind( null, theme );
		} else if ( site ) {
			if ( name === 'customize' ) {
				action = actions.customize.bind( actions, theme, site, 'showcase' );
			} else {
				action = actions[ name ].bind( actions, theme, site, 'showcase' );
			}
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

function rawOptions( site, theme ) {
	return [
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
			hasUrl: false,
			hideIf: theme.active
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
			hideIf: theme.active || theme.purchased || ! theme.price
		},
		{
			name: 'activate',
			label: i18n.translate( 'Activate' ),
			header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
			hasAction: true,
			hideIf: theme.active || ( theme.price && ! theme.purchased )
		},
		{
			name: 'customize',
			label: i18n.translate( 'Customize' ),
			header: i18n.translate( 'Customize on:', { comment: 'label for selecting a site for which to customize a theme' } ),
			hasAction: true,
			hideIf: ! theme.active || ( site && ! site.isCustomizable() )
		},
		{
			separator: true
		},
		{
			name: 'details',
			label: i18n.translate( 'Details' ),
			hasUrl: true
		},
		{
			name: 'support',
			label: i18n.translate( 'Support' ),
			hasUrl: true,
			hideIf: site && site.jetpack // We don't know where support docs for a given theme on a self-hosted WP install are.
		},
	];
}
