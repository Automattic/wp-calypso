/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import config from 'config';
import QueryUserSettings from 'components/data/query-user-settings';
import getUserSetting from 'state/selectors/get-user-setting';
import { ENABLE_TRANSLATOR_KEY } from 'lib/i18n-utils/constants';

export const CommunityTranslatorComponent = ( { communityTranslatorEnabled } ) =>
	config.isEnabled( 'i18n/community-translator' ) ? (
		<>
			<QueryUserSettings />
			{ communityTranslatorEnabled && (
				<AsyncLoad require="components/community-translator/community-translator" />
			) }
		</>
	) : (
		<AsyncLoad require="layout/community-translator/launcher" placeholder={ null } />
	);

export default connect( state => ( {
	communityTranslatorEnabled:
		config.isEnabled( 'i18n/community-translator' ) &&
		getUserSetting( state, ENABLE_TRANSLATOR_KEY ),
} ) )( CommunityTranslatorComponent );
