/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import AcceptedFilenames from './accepted-filenames';
import Advanced from './advanced';
import CacheLocation from './cache-location';
import Caching from './caching';
import DirectlyCachedFiles from './directly-cached-files';
import ExpiryTime from './expiry-time';
import FixConfig from './fix-config';
import LockDown from './lock-down';
import Miscellaneous from './miscellaneous';
import QueryNotices from './data/query-notices';
import RejectedUserAgents from './rejected-user-agents';
import WrapSettingsForm from './wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNotices } from './state/notices/selectors';

const AdvancedTab = ( {
	fields: {
		is_cache_enabled,
		is_super_cache_enabled,
	},
	notices,
	siteId,
} ) => {
	return (
		<div>
			<QueryNotices siteId={ siteId } />
			<Caching />
			<Miscellaneous notices={ notices } />
			<Advanced />
			<CacheLocation />
			<ExpiryTime />
			<AcceptedFilenames />
			<RejectedUserAgents />
			<LockDown />
			{ is_cache_enabled && is_super_cache_enabled &&
				<DirectlyCachedFiles notices={ notices } />
			}
			<FixConfig />
		</div>
	);
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const notices = getNotices( state, siteId );

		return {
			notices,
		};
	}
);

const getFormSettings = settings => {
	return pick( settings, [
		'is_cache_enabled',
		'is_super_cache_enabled',
	] );
};

export default flowRight(
	connectComponent,
	WrapSettingsForm( getFormSettings )
)( AdvancedTab );
