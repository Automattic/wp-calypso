/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';

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
import RejectedUserAgents from './rejected-user-agents';
import WrapSettingsForm from './wrap-settings-form';

const AdvancedTab = ( {
	fields: {
		super_cache_enabled,
		wp_cache_enabled,
	},
	siteUrl,
} ) => {
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
			{	!! wp_cache_enabled && ( '1' === super_cache_enabled || '2' === super_cache_enabled ) &&
				<DirectlyCachedFiles siteUrl={ siteUrl } />
			}
			<FixConfig />
		</div>
	);
};
const getFormSettings = settings => {
	return pick( settings, [
		'super_cache_enabled',
		'wp_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( AdvancedTab );
