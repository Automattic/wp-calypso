/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExtensionRedirect from 'blocks/extension-redirect';
import AdvancedTab from '../components/advanced';
import CdnTab from '../components/cdn';
import ContentsTab from '../components/contents';
import DebugTab from '../components/debug';
import EasyTab from '../components/easy';
import Main from 'components/main';
import Navigation from '../components/navigation';
import Notice from 'components/notice';
import PreloadTab from '../components/preload';
import QueryStatus from '../components/data/query-status';
import { Tabs } from './constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatus } from '../state/status/selectors';

class WPSuperCache extends Component {
	static propTypes = {
		status: PropTypes.object.isRequired,
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
			case Tabs.DEBUG:
				return <DebugTab />;
			default:
				return <EasyTab isReadOnly={ isReadOnly } />;
		}
	}

	render() {
		const {
			site,
			siteId,
			status: { cache_disabled: cacheDisabled },
			tab,
			translate,
		} = this.props;
		const mainClassName = 'wp-super-cache__main';

		return (
			<Main className={ mainClassName }>
				<ExtensionRedirect pluginId="wp-super-cache" siteId={ siteId } />
				<QueryStatus siteId={ siteId } />

				{ cacheDisabled &&
				<Notice
					showDismiss={ false }
					status="is-error"
					text={ translate( 'Read Only Mode. Configuration cannot be changed.' ) } />
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
			status: getStatus( state, siteId ),
			siteId,
		};
	}
);

export default connectComponent( localize( WPSuperCache ) );
