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

/**
 * Module Variables
 */
const tabs = [ 'easy', 'advanced', 'cdn', 'contents', 'preload', 'plugins', 'debug' ];

const Navigation = ( { activeTab, translate } ) => {
	const getLabel = tab => {
		switch ( tab ) {
			case 'easy':
				return translate( 'Easy' );
			case 'advanced':
				return translate( 'Advanced' );
			case 'cdn':
				return translate( 'CDN' );
			case 'contents':
				return translate( 'Contents' );
			case 'preload':
				return translate( 'Preload' );
			case 'plugins':
				return translate( 'Plugins' );
			case 'debug':
				return translate( 'Debug' );
		}
	};

	const renderTabItems = () => {
		return tabs.map( tab => {
			let path = '/extensions/wp-super-cache';

			if ( tab !== tabs[ 0 ] ) {
				path = `/extensions/wp-super-cache/${ tab }`;
			}

			return (
				<SectionNavTabItem
					key={ `wp-super-cache-${ tab }` }
					path={ path }
					selected={ ( activeTab || tabs[ 0 ] ) === tab }>
					{ getLabel( tab ) }
				</SectionNavTabItem>
			);
		} );
	};

	return (
		<SectionNav selectedText="Settings">
			<SectionNavTabs>
				{ renderTabItems() }
			</SectionNavTabs>
		</SectionNav>
	);
};

Navigation.propTypes = {
	activeTab: PropTypes.string,
	translate: PropTypes.func.isRequired
};

Navigation.defaultProps = {
	activeTab: ''
};

export default localize( Navigation );
