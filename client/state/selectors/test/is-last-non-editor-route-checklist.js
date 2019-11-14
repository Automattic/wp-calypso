/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isLastNonEditorRouteChecklist from 'state/selectors/is-last-non-editor-route-checklist';
import { ROUTE_SET } from 'state/action-types';

const blockEditorAction = { type: ROUTE_SET, path: '/block-editor/page/1' };
const checklistAction = { type: ROUTE_SET, path: '/checklist/examplesite.com' };
const otherAction = { type: ROUTE_SET, path: '/some/other/url' };

describe( 'isLastNonEditorRouteChecklist()', () => {
	test( 'should return true if the previous path contains a checklist url part', () => {
		const state = {
			ui: {
				route: {
					path: {
						previous: '/checklist/examplesite.com',
					},
				},
			},
		};

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.true;
	} );

	test( 'should return true if a block-editor URL exists between current nav and the last checklist route', () => {
		const state = { ui: { actionLog: [ checklistAction, blockEditorAction ] } };

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.true;
	} );

	test( 'should respect the order of the action log and read from end of the log, not the beginning', () => {
		const state = { ui: { actionLog: [ blockEditorAction, checklistAction, otherAction ] } };

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.false;
	} );

	test( 'should return false if there are not only block-editor URLs between current nav and the last checklist route', () => {
		const state = { ui: { actionLog: [ checklistAction, otherAction ] } };

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.false;
	} );

	test( 'should return false if there is no checklist route in the actionLog', () => {
		const state = { ui: { actionLog: [ blockEditorAction, otherAction ] } };

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.false;
	} );

	test( 'should return true, regardless of previousPath, if there have only been block-editor routes since the last checklist route', () => {
		const state = {
			ui: {
				actionLog: [ checklistAction, blockEditorAction ],
				route: {
					path: {
						previous: '/some/other/url',
					},
				},
			},
		};

		expect( isLastNonEditorRouteChecklist( state ) ).to.be.true;
	} );
} );
