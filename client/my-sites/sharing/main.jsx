/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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

class Sharing extends Component {
	getFilters() {
		const { canManageOptions, site, translate } = this.props;
		const pathSuffix = site ? '/' + site.slug : '';
		const filters = [];

		// Include Connections link if all sites are selected. Otherwise,
		// verify that the required Jetpack module is active
		if ( ! site || ! site.jetpack || site.isModuleActive( 'publicize' ) ) {
			filters.push( {
				id: 'sharing-connections',
				path: '/sharing' + pathSuffix,
				title: translate( 'Connections' ),
			} );
		}

		// Include Sharing Buttons link if a site is selected and the
		// required Jetpack module is active
		if ( site && canManageOptions &&
			( ! site.jetpack ||
				( site.isModuleActive( 'sharedaddy' ) && site.versionCompare( '3.4-dev', '>=' ) )
			)
		) {
			filters.push( {
				id: 'sharing-buttons',
				path: '/sharing/buttons' + pathSuffix,
				title: translate( 'Sharing Buttons' ),
			} );
		}

		return filters;
	}

	render() {
		const filters = this.getFilters();
		const selected = find( filters, { path: this.props.path } );

		return (
			<Main className="sharing">
				<DocumentHead title={ this.props.translate( 'Sharing', { textOnly: true } ) } />
				<SidebarNavigation />
				<SectionNav selectedText={ get( selected, 'title', '' ) }>
					<NavTabs>
						{ filters.map( ( { id, path, title } ) => (
							<NavItem key={ id } path={ path } selected={ path === this.props.path }>
								{ title }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
				<UpgradeNudge
					title={ this.props.translate( 'No Ads with WordPress.com Premium' ) }
					message={ this.props.translate( 'Prevent ads from showing on your site.' ) }
					feature="no-adverts"
					event="sharing_no_ads"
				/>
				{ this.props.contentComponent }
			</Main>
		);
	}
}

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
