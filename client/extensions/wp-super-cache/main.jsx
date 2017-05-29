/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AdvancedTab from './advanced-tab';
import CdnTab from './cdn-tab';
import ContentsTab from './contents-tab';
import EasyTab from './easy-tab';
import Main from 'components/main';
import Navigation from './navigation';
import Notice from 'components/notice';
import PreloadTab from './preload-tab';
import QueryNotices from './data/query-notices';
import { Tabs } from './constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNotices } from './state/notices/selectors';

const WPSuperCache = ( { notices, site, siteId, tab } ) => {
	const renderTab = () => {
		switch ( tab ) {
			case Tabs.ADVANCED:
				return <AdvancedTab />;
			case Tabs.CDN:
				return <CdnTab />;
			case Tabs.CONTENTS:
				return <ContentsTab />;
			case Tabs.PRELOAD:
				return <PreloadTab />;
			default:
				return <EasyTab />;
		}
	};

	const cacheDisabled = get( notices, 'cache_disabled' );
	const cacheDisabledMessage = get( notices.cache_disabled, 'message' );

	return (
		<Main className="wp-super-cache__main">
			<QueryNotices siteId={ siteId } />

			{ cacheDisabled &&
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ cacheDisabledMessage } />
			}

			<Navigation activeTab={ tab } site={ site } />
			{ renderTab() }
		</Main>
	);
};

WPSuperCache.propTypes = {
	notices: PropTypes.object.isRequired,
	site: PropTypes.object,
	siteId: PropTypes.number,
	tab: PropTypes.string,
};

WPSuperCache.defaultProps = {
	tab: '',
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			notices: getNotices( state, siteId ),
			siteId,
		};
	}
);

export default connectComponent( WPSuperCache );
