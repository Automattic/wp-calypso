/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import InlineHelp from 'blocks/inline-help';
import config from 'config';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import HappychatButton from 'components/happychat/button';
import { isCommunityTranslatorEnabled } from 'components/community-translator/utils';
import AsyncLoad from 'components/async-load';
import TranslatorLauncher from 'layout/community-translator/launcher';

const FloatingActions = ( { isHappychatButtonVisible } ) => (
	<div className="floating-actions">
		<div className="floating-actions__vertical-bar">
			<InlineHelp />
			{ config.isEnabled( 'i18n/community-translator' ) ? (
				isCommunityTranslatorEnabled() && <AsyncLoad require="components/community-translator" />
			) : (
				<TranslatorLauncher />
			) }
			{ isHappychatButtonVisible &&
				config.isEnabled( 'happychat' ) && <HappychatButton allowMobileRedirect /> }
		</div>
		{ /* TODO: Move environment badge here */ }
	</div>
);

FloatingActions.displayName = 'FloatingActions';

export default connect( state => ( {
	isHappychatButtonVisible: hasActiveHappychatSession( state ),
} ) )( FloatingActions );
