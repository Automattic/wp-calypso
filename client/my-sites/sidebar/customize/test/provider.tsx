/**
 * @jest-environment jsdom
 */

import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BODY_CUSTOMIZE_CLASS, CustomizeProvider, useCustomizeContext } from '../index';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';
import type { JSX } from 'react';

function renderInProvider( ui: JSX.Element ) {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345 },
		adminSidebarLayout: { bySite: {} },
		adminSidebarExpandState: { bySite: {} },
	} );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

let exposedCtx: ReturnType< typeof useCustomizeContext > | null = null;
function ExposeContext() {
	exposedCtx = useCustomizeContext();
	return null;
}

describe( '<CustomizeProvider>', () => {
	beforeEach( () => {
		exposedCtx = null;
		document.body.className = '';
		jest.restoreAllMocks();
	} );

	it( 'starts with isCustomizing=false and no body class', () => {
		renderInProvider(
			<CustomizeProvider>
				<ExposeContext />
			</CustomizeProvider>
		);
		expect( exposedCtx?.isCustomizing ).toBe( false );
		expect( document.body.classList.contains( BODY_CUSTOMIZE_CLASS ) ).toBe( false );
	} );

	it( 'flips body class on enter and removes it on exit', () => {
		renderInProvider(
			<CustomizeProvider>
				<ExposeContext />
			</CustomizeProvider>
		);
		act( () => {
			exposedCtx?.enter();
		} );
		expect( document.body.classList.contains( BODY_CUSTOMIZE_CLASS ) ).toBe( true );
		act( () => {
			exposedCtx?.exit();
		} );
		expect( document.body.classList.contains( BODY_CUSTOMIZE_CLASS ) ).toBe( false );
	} );

	it( 'commitMove marks dirty and queues an autosave', () => {
		const saveLayoutImpl = jest.fn( () => new Promise< LayoutDelta >( () => {} ) );
		renderInProvider(
			<CustomizeProvider saveLayoutImpl={ saveLayoutImpl }>
				<ExposeContext />
			</CustomizeProvider>
		);
		act( () => {
			exposedCtx?.enter();
		} );
		act( () => {
			exposedCtx?.commitMove(
				'plugin:foo:-:foo.php',
				{
					kind: 'in_group',
					group_id: 'plugins',
					index: 0,
				},
				{
					previousPosition: { kind: 'top_level', index: 3 },
					label: 'Foo',
				}
			);
		} );
		expect( exposedCtx?.draft.isDirty ).toBe( true );
		expect( exposedCtx?.draft.isSaving ).toBe( true );
		expect( exposedCtx?.canUndo ).toBe( true );
		expect( saveLayoutImpl ).toHaveBeenCalledTimes( 1 );
	} );
} );
