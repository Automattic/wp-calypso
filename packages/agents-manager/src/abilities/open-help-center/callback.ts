import { __ } from '@wordpress/i18n';
import { isRecord } from '../../utils/is-record';
import { BIG_SKY_SHOW_COMPONENT_TOOL_ID } from '../../utils/show-component-tools';
import { successResult } from '../ability-result';
import type { AbilityResult } from '../types';

/** The chat component type the ability's message carries. */
export const OPEN_HELP_CENTER_BUTTON_TYPE = 'open-help-center-button';

const asText = ( value: unknown ): string | undefined =>
	typeof value === 'string' && value.trim() ? value.trim() : undefined;

/**
 * The `open-help-center` ability callback. Opens nothing itself: it hands the
 * chat a button, so the user decides when to leave for the support chat.
 */
export async function openHelpCenterCallback( rawInput: unknown ): Promise< AbilityResult > {
	const input = isRecord( rawInput ) ? rawInput : {};
	const message = asText( input.message );
	const summary =
		asText( input.summary ) ??
		__(
			'Click the button below to open the Help Center and talk to a human.',
			__i18n_text_domain__
		);

	return {
		...successResult( summary ),
		agentMessage: JSON.stringify( {
			tool_id: BIG_SKY_SHOW_COMPONENT_TOOL_ID,
			data: {
				type: OPEN_HELP_CENTER_BUTTON_TYPE,
				props: { message },
				summary,
				isCurrent: true,
			},
		} ),
	};
}
