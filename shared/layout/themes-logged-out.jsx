/**
 * External dependencies
 */
import React from 'react';
import partialRight from 'lodash/function/partialRight';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar';
//import NoticesList from 'notices/notices-list';
//import notices from 'notices';
//import title from 'lib/screen-title';
import Main from 'components/main';
import themesComponent from 'my-sites/themes/themes-selection';
import getButtonOptions from 'my-sites/themes/theme-options';

const themesFactory = React.createFactory( themesComponent );

const ThemesLoggedOutLayout = React.createClass( {

	getDefaultProps() {
		return {
			section: 'themes',
		}
	},

	themesProps: {
		getOptions: partialRight( getButtonOptions, () => {}, () => {} ),
		sites: false,
		setSelectedTheme: () => {},
		togglePreview: () => {},
		loggedIn: false,
	},

	getTier() {
		const tier = typeof( window ) !== 'undefined' && window.location.pathname.match( /^\/design\/type\/(free|premium|all)\/?/ );
		if ( tier ) {
			return { tier: tier[1] };
		}
	},

	render() {
		const sectionClass = 'wp' + ( this.props.section ? ' is-section-' + this.props.section : '' );
		return (
						<div className={ sectionClass }>
							<Masterbar />
							<div id="content" className="wp-content">
								<div id="primary" className="wp-primary wp-section">
									<Main className="themes">
									{ themesFactory( Object.assign( {}, this.themesProps, this.getTier(), this.props ) ) }
									</Main>
								</div>
							</div>
							<div id="tertiary" className="wp-overlay fade-background">
								{ this.props.tertiary }
							</div>
						</div>
		);
	}
} );

export default ThemesLoggedOutLayout;
