/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MasterbarMinimal from 'layout/masterbar/minimal';
import ThemesHead from 'my-sites/themes/head';
import ThemeSheetComponent from 'my-sites/themes/sheet';

const LayoutLoggedOutDesign = ( { routeName, match, section, hasSidebar, isFullScreen, tier = 'all' } ) => {
	const primary = routeName === 'themes' ? <ThemeSheetComponent themeSlug={ match.theme_slug } /> : null;
	const sectionClass = section ? 'is-section-' + section : '';
	const classes = classNames( 'wp layout', sectionClass, {
		'focus-content': true,
		'has-no-sidebar': ! hasSidebar,
		'full-screen': isFullScreen,
	} );

	return (
		<div className={ classes }>
			<ThemesHead tier={ tier } isSheet={ routeName === 'themes' } />
			<MasterbarMinimal url="/" />
			<div id="content" className="wp-content">
				<div id="primary" className="wp-primary wp-section">
					{ primary }
				</div>
				<div id="secondary" className="wp-secondary" />
			</div>
			<div id="tertiary" className="wp-overlay fade-background" />
		</div>
	);
}

LayoutLoggedOutDesign.displayName = 'LayoutLoggedOutDesign';
LayoutLoggedOutDesign.propTypes = {
	section: React.PropTypes.string,
	hasSidebar: React.PropTypes.bool,
	isFullScreen: React.PropTypes.bool,
	tier: React.PropTypes.string,
}

export default connect(
	( state, props ) => Object.assign(
		{},
		props,
		{
			section: state.ui.section,
			hasSidebar: state.ui.hasSidebar,
			isFullScreen: state.ui.isFullScreen,
		}
	)
)( LayoutLoggedOutDesign );
