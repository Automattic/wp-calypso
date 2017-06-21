/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
import QueryStatus from './data/query-status';
import { Tabs } from './constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNotices } from './state/notices/selectors';

class WPSuperCache extends Component {
	static propTypes = {
		notices: PropTypes.object.isRequired,
		site: PropTypes.object,
		siteId: PropTypes.number,
		tab: PropTypes.string,
	};

	static defaultProps = {
		tab: '',
	};

	renderTab( isReadOnly ) {
		const { tab } = this.props;

		switch ( tab ) {
			case Tabs.ADVANCED:
				return <AdvancedTab isReadOnly={ isReadOnly } />;
			case Tabs.CDN:
				return <CdnTab />;
			case Tabs.CONTENTS:
				return <ContentsTab isReadOnly={ isReadOnly } />;
			case Tabs.PRELOAD:
				return <PreloadTab />;
			default:
				return <EasyTab isReadOnly={ isReadOnly } />;
		}
	}

	render() {
		const {
			notices,
			site,
			siteId,
			tab,
		} = this.props;
		const mainClassName = 'wp-super-cache__main';
		const cacheDisabled = get( notices, 'cache_disabled' );
		const cacheDisabledMessage = get( notices.cache_disabled, 'message' );

		return (
			<Main className={ mainClassName }>
				<QueryStatus siteId={ siteId } />

				{ cacheDisabled &&
				<Notice
					showDismiss={ false }
					status="is-error"
					text={ cacheDisabledMessage } />
				}

				<Navigation activeTab={ tab } site={ site } />
				{ this.renderTab( !! cacheDisabled ) }
			</Main>
		);
	}
}

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
