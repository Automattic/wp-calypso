import { sparkles } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

type StatsEmptyActionAIProps = {
	from: string;
};

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_AI_URL =
	'https://jetpack.com/support/jetpack-blocks/jetpack-ai-assistant-block/';

const StatsEmptyActionAI: React.FC< StatsEmptyActionAIProps > = ( { from } ) => {
	const translate = useTranslate();

	return (
		<EmptyStateAction
			icon={ sparkles }
			text={ translate( 'Craft engaging content with Jetpack AI assistant' ) }
			analyticsDetails={ {
				from: from,
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
