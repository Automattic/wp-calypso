/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import AcceptedFilenames from './components/advanced/accepted-filenames';
import Advanced from './components/advanced/advanced';
import CacheLocation from './components/advanced/cache-location';
import Caching from './components/advanced/caching';
import Easy from './components/easy/easy';
import ExpiryTime from './components/advanced/expiry-time';
import FixConfig from './components/advanced/fix-config';
import LockDown from './components/advanced/lock-down';
import Main from 'components/main';
import Miscellaneous from './components/advanced/miscellaneous';
import Navigation from './components/navigation';
import RejectedUserAgents from './components/advanced/rejected-user-agents';
import { Tabs } from './constants';

const WPSuperCache = ( { site, tab } ) => {
	const renderTab = () => {
		switch ( tab ) {
			case Tabs.ADVANCED:
				return (
					<div>
						<Caching />
						<Miscellaneous />
						<Advanced />
						<CacheLocation />
						<ExpiryTime />
						<AcceptedFilenames />
						<RejectedUserAgents />
						<LockDown />
						<FixConfig />
					</div>
				);
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
