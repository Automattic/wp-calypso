/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/selectors';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradeNudge from 'my-sites/upgrade-nudge';

export const Sharing = ( { canManageOptions, contentComponent, path, site, translate } ) => {
	const pathSuffix = site ? '/' + site.slug : '';
	const filters = [];

	// Include Connections link if all sites are selected. Otherwise,
	// verify that the required Jetpack module is active
	if ( ! site || ! site.jetpack || site.isModuleActive( 'publicize' ) ) {
		filters.push( {
			id: 'sharing-connections',
			route: '/sharing' + pathSuffix,
			title: translate( 'Connections' ),
		} );
	}

	// Include Sharing Buttons link if a site is selected and the
	// required Jetpack module is active
	if ( site && canManageOptions &&
		( ! site.jetpack || ( site.isModuleActive( 'sharedaddy' ) && site.versionCompare( '3.4-dev', '>=' ) ) )
	) {
		filters.push( {
			id: 'sharing-buttons',
			route: '/sharing/buttons' + pathSuffix,
			title: translate( 'Sharing Buttons' ),
		} );
	}

	const selected = find( filters, { route: path } );

	return (
		<Main className="sharing">
			<DocumentHead title={ translate( 'Sharing', { textOnly: true } ) } />
			<SidebarNavigation />
			<SectionNav selectedText={ get( selected, 'title', '' ) }>
				<NavTabs>
					{ filters.map( ( { id, route, title } ) => (
						<NavItem key={ id } path={ route } selected={ path === route }>
							{ title }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
			<UpgradeNudge
				event="sharing_no_ads"
				feature="no-adverts"
				message={ translate( 'Prevent ads from showing on your site.' ) }
				title={ translate( 'No Ads with WordPress.com Premium' ) }
			/>
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	canManageOptions: PropTypes.bool,
	contentComponent: PropTypes.node,
	path: PropTypes.string,
	site: PropTypes.object,
	translate: PropTypes.func,
};

export default connect(
	( state, { site } ) => ( {
		canManageOptions: canCurrentUser( state, get( site, 'ID' ), 'manage_options' ),
	} ),
)( localize( Sharing ) );
