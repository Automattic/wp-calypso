import { localizeUrl } from '@automattic/i18n-utils';
import { starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_AI_URL =
	'https://jetpack.com/support/jetpack-blocks/jetpack-ai-assistant-block/';

const StatsEmptyActionAI: React.FC = () => {
	const translate = useTranslate();

	return (
		<EmptyStateAction
			icon={ starEmpty }
			text={ translate( 'Craft engaging content with Jetpack AI assistant' ) }
			analyticsDetails={ {
				from: 'module_top_posts',
				feature: 'ai_assistant',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout( () => ( window.location.href = localizeUrl( JETPACK_SUPPORT_AI_URL ) ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionAI;
