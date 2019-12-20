/**
 * Internal dependencies
 */
import { VerticalsTemplatesActionType as ActionType, Template } from './types';

export const receiveTemplates = ( verticalId: string, templates: Template[] ) => ( {
	type: ActionType.RECEIVE_TEMPLATES as const,
	verticalId,
	templates,
} );
