/**
 * Internal dependencies
 */
import * as Actions from './actions';
import { ActionsDefinedInModule } from '../mapped-types';

export const enum ActionType {
	RECEIVE_VERTICALS = 'RECEIVE_VERTICALS',
}

export type VerticalsActions = ActionsDefinedInModule< typeof Actions >;

/**
 * Representation of well-known verticals
 */
export interface Vertical {
	is_user_input_vertical: false;

	vertical_id: string;
	vertical_slug: string;
	vertical_name: string;
	parent: string;
	preview: string;
	preview_styles_url: string;
	synonyms: string[];
}
