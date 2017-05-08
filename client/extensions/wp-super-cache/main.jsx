/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import AdvancedTab from './advanced-tab';
import CdnTab from './cdn-tab';
import ContentsTab from './contents-tab';
import EasyTab from './easy-tab';
import PreloadTab from './preload-tab';
import Main from 'components/main';
import Navigation from './navigation';
import { Tabs } from './constants';

const WPSuperCache = ( { site, tab } ) => {
	const renderTab = () => {
		switch ( tab ) {
			case Tabs.ADVANCED:
				return <AdvancedTab siteUrl={ site.URL } />;
			case Tabs.CDN:
				return <CdnTab siteUrl={ site.URL } />;
			case Tabs.CONTENTS:
				return <ContentsTab isMultisite={ site.is_multisite } />;
			case Tabs.PRELOAD:
				return <PreloadTab />;
			default:
				return <EasyTab site={ site } />;
		}
	};

	return (
		<Main className="wp-super-cache__main">
			<Navigation activeTab={ tab } site={ site } />
			{ renderTab() }
		</Main>
	);
};

WPSuperCache.propTypes = {
	site: React.PropTypes.object,
	tab: PropTypes.string,
};

WPSuperCache.defaultProps = {
	tab: ''
};

export default WPSuperCache;
