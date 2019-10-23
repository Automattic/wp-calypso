/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { debounce, get } from 'lodash';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const trackFullSiteEditingEditTemplatePart = ( event, target ) => {
	const templatePartType = get( target, [ 'dataset', 'templatePartType' ] );
	tracksRecordEvent( 'wpcom_block_editor_a8c_fse_edit_template_part', {
		template_part: templatePartType,
	} );
};

/**
 * Return the event definition object to track `wpcom_block_editor_a8c_fse_edit_template_part`.
 *
 * @return {{handler: function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.template__block-container .template-block__overlay a',
	type: 'click',
	handler: debounce( trackFullSiteEditingEditTemplatePart, 1000, { leading: true } ),
} );
