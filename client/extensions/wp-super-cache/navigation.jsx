/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import { Tabs } from './constants';

const Navigation = ( { activeTab, site, translate } ) => {
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

			path += `/${ site.slug }`;

			return (
				<SectionNavTabItem
					key={ `wp-super-cache-${ tab }` }
					path={ path }
					selected={ ( activeTab || Tabs.EASY ) === tab }>
					{ getLabel( tab ) }
				</SectionNavTabItem>
			);
		} );
	};

	return (
		<SectionNav selectedText="Settings">
			<SectionNavTabs>
				{ renderTabItems( getTabs() ) }
			</SectionNavTabs>
		</SectionNav>
	);
};

Navigation.propTypes = {
	activeTab: PropTypes.string,
	site: React.PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
	activeTab: ''
};

export default localize( Navigation );
