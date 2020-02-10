/**
 * Internal dependencies
 */
import { Template } from './types';

export const receiveTemplates = ( verticalId: string, templates: Template[] ) => ( {
	type: 'RECEIVE_TEMPLATES' as const,
	verticalId,
	templates,
} );

export type Action = ReturnType< typeof receiveTemplates >;
