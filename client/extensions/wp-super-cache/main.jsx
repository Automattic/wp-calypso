/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import AdvancedTab from './components/advanced';
import Easy from './components/easy/easy';
import Main from 'components/main';
import Navigation from './components/navigation';
import { Tabs } from './constants';

const WPSuperCache = ( { site, tab } ) => {
	const renderTab = () => {
		switch ( tab ) {
			case Tabs.ADVANCED:
				return <AdvancedTab site={ site } />;
			case Tabs.CDN:
				break;
			case Tabs.CONTENTS:
				break;
			case Tabs.PRELOAD:
				break;
			case Tabs.PLUGINS:
				break;
			case Tabs.DEBUG:
				break;
			default:
				return <Easy site={ site } />;
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
