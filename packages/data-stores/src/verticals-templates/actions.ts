/**
 * Internal dependencies
 */
import { Template } from './types';

export const receiveTemplates = ( verticalId: string, templates: Template[] ) =>
	( {
		type: 'RECEIVE_TEMPLATES',
		verticalId,
		templates,
	} as const );

export const receiveVerticalTemplate = (
	verticalId: string,
	templateSlug: string,
	template: Template
) =>
	( {
		type: 'RECEIVE_VERTICAL_TEMPLATE',
		verticalId,
		templateSlug,
		template,
	} as const );

export type Action = ReturnType< typeof receiveTemplates | typeof receiveVerticalTemplate >;
