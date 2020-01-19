/**
 * Internal dependencies
 */
import { ActionType, Template } from './types';

export const receiveTemplates = ( verticalId: string, templates: Template[] ) => ( {
	type: ActionType.RECEIVE_TEMPLATES as const,
	verticalId,
	templates,
} );

export type Action = ReturnType< typeof receiveTemplates >;
