/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import { addSiteFragment } from 'lib/route/path';
import { getSiteSlug } from 'state/sites/selectors';
import { Tabs } from '../../app/constants';

const Navigation = ( { activeTab, siteSlug, translate } ) => {
	const getLabel = tab => {
		switch ( tab ) {
			case Tabs.EASY:
				return translate( 'Easy' );
			case Tabs.ADVANCED:
				return translate( 'Advanced' );
			case Tabs.CDN:
				return translate( 'CDN' );
			case Tabs.CONTENTS:
				return translate( 'Contents' );
			case Tabs.PRELOAD:
				return translate( 'Preload' );
			case Tabs.DEBUG:
				return translate( 'Debug' );
		}
	};

	const getTabs = () => {
		const tabs = [];

		for ( const key in Tabs ) {
			if ( Tabs.hasOwnProperty( key ) ) {
				tabs.push( Tabs[ key ] );
			}
		}

		return tabs;
	};

	const renderTabItems = ( tabs ) => {
		return tabs.map( tab => {
			let path = '/extensions/wp-super-cache';

			if ( tab !== Tabs.EASY ) {
				path = `${ path }/${ tab }`;
			}

			return (
				<SectionNavTabItem
					key={ `wp-super-cache-${ tab }` }
					path={ siteSlug && addSiteFragment( path, siteSlug ) }
					selected={ ( activeTab || Tabs.EASY ) === tab }>
					{ getLabel( tab ) }
				</SectionNavTabItem>
			);
		} );
	};

	const pluginPath = '/plugins/wp-super-cache';
	return (
		<div>
			<HeaderCake backText={ translate( 'Plugin Overview' ) }
				backHref={ siteSlug && addSiteFragment( pluginPath, siteSlug ) }>
				WP Super Cache
			</HeaderCake>
			<SectionNav selectedText="Settings">
				<SectionNavTabs>
					{ renderTabItems( getTabs() ) }
				</SectionNavTabs>
			</SectionNav>
		</div>
	);
};

Navigation.propTypes = {
	activeTab: PropTypes.string,
	siteId: PropTypes.number,
	// connected props
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
	activeTab: '',
};

const connectComponent = connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId )
	} )
);

export default connectComponent( localize( Navigation ) );
