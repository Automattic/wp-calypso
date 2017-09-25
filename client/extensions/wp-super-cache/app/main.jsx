/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AdvancedTab from '../components/advanced';
import CdnTab from '../components/cdn';
import ContentsTab from '../components/contents';
import QueryStatus from '../components/data/query-status';
import DebugTab from '../components/debug';
import EasyTab from '../components/easy';
import Navigation from '../components/navigation';
import PreloadTab from '../components/preload';
import { getStatus } from '../state/status/selectors';
import { Tabs } from './constants';
import ExtensionRedirect from 'blocks/extension-redirect';
import Main from 'components/main';
import Notice from 'components/notice';
import { getSelectedSiteId } from 'state/ui/selectors';

class WPSuperCache extends Component {
	static propTypes = {
		status: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		tab: PropTypes.string,
	};

	static defaultProps = {
		tab: '',
	};

	renderTab( isReadOnly ) {
		const { tab } = this.props;

		switch ( tab ) {
			case Tabs.ADVANCED.slug:
				return <AdvancedTab isReadOnly={ isReadOnly } />;
			case Tabs.CDN.slug:
				return <CdnTab />;
			case Tabs.CONTENTS.slug:
				return <ContentsTab isReadOnly={ isReadOnly } />;
			case Tabs.PRELOAD.slug:
				return <PreloadTab />;
			case Tabs.DEBUG.slug:
				return <DebugTab />;
			default:
				return <EasyTab isReadOnly={ isReadOnly } />;
		}
	}

	render() {
		const {
			siteId,
			status: { cache_disabled: cacheDisabled },
			tab,
			translate,
		} = this.props;
		const mainClassName = 'wp-super-cache__main';

		return (
			<Main className={ mainClassName }>
				<ExtensionRedirect pluginId="wp-super-cache"
					minimumVersion="1.5.4"
					siteId={ siteId } />
				<QueryStatus siteId={ siteId } />

				{ cacheDisabled &&
				<Notice
					showDismiss={ false }
					status="is-error"
					text={ translate( 'Read Only Mode. Configuration cannot be changed.' ) } />
				}

				<Navigation activeTab={ tab } siteId={ siteId } />
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
			siteId
		};
	}
);

export default connectComponent( localize( WPSuperCache ) );
