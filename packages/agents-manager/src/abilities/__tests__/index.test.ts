/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/abilities', () => ( {
	getAbility: jest.fn(),
	registerAbility: jest.fn(),
	registerAbilityCategory: jest.fn(),
	unregisterAbility: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( { select: () => undefined, dispatch: () => undefined } ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );

const mockShowComponentCallback = jest.fn();
jest.mock( '../show-component', () => ( {
	showComponentAbility: { name: 'big-sky/show-component', callback: mockShowComponentCallback },
} ) );

const mockShowTemplateCallback = jest.fn();
jest.mock( '../show-template', () => ( {
	showTemplateAbility: { name: 'big-sky/show-template', callback: mockShowTemplateCallback },
} ) );

import { executeAbilityFromList } from '../execute-ability';

// Registration runs once per module instance, so each test loads fresh
// modules (and the matching mock instances) to start clean.
async function load() {
	jest.resetModules();
	const abilities = jest.requireMock( '@wordpress/abilities' );
	const facade = await import( '..' );
	const editorAbilities = await import( '../editor-abilities' );
	return { ...facade, editorAbilities, ...abilities } as typeof facade & {
		editorAbilities: typeof editorAbilities;
		getAbility: jest.Mock;
		registerAbility: jest.Mock;
		registerAbilityCategory: jest.Mock;
		unregisterAbility: jest.Mock;
	};
}

// The editor count reads the real `EDITOR_ABILITIES` list, so it stays
// correct as abilities migrate in; the all-surface names are mirrored by
// hand (the facade does not export its list).
// Compared by name: `load()` resets modules, so instances never match.
const ALL_SURFACE_ABILITY_NAMES = [ 'wp-admin/navigate' ];

async function ownedAbilityNames( provider: {
	getAbilities: () => Promise< { name: string }[] >;
} ) {
	return ( await provider.getAbilities() ).map( ( { name } ) => name );
}

async function editorAbilityCount() {
	return ( await import( '../editor-abilities' ) ).getEditorAbilities().length;
}

async function ownedAbilityCount() {
	return ALL_SURFACE_ABILITY_NAMES.length + ( await editorAbilityCount() );
}

// The facade gates on `isEditorPage()`, which reads the admin body classes.
function setEditorPage( isEditor: boolean ) {
	document.body.classList.toggle( 'site-editor-php', isEditor );
}

beforeEach( () => {
	jest.clearAllMocks();
	document.body.className = '';
	window.history.replaceState( {}, '', '/' );
} );

describe( 'abilities facade', () => {
	it( 'owns only the all-surface abilities off the editor', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { registerAmAbilities, amToolProvider, getAmCheckpointContext, registerAbility } =
			await load();

		await registerAmAbilities();

		expect( registerAbility ).not.toHaveBeenCalled();
		await expect( ownedAbilityNames( amToolProvider ) ).resolves.toEqual(
			ALL_SURFACE_ABILITY_NAMES
		);
		expect( getAmCheckpointContext() ).toEqual( [] );
		await expect( amToolProvider.executeAbility( 'big_sky__show_component', {} ) ).rejects.toThrow(
			'Agents Manager does not own the ability: big_sky__show_component'
		);
		expect( error ).toHaveBeenCalled();
	} );

	it( 'registers the abilities when the chat mounts', async () => {
		setEditorPage( true );
		const { registerAmAbilities, registerAbility } = await load();

		await registerAmAbilities();

		// Registration runs fire-and-forget with the load — let it settle.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( registerAbility ).toHaveBeenCalledTimes( await editorAbilityCount() );
	} );

	it.each( [
		[ 'the site editor', [ 'site-editor-php' ] ],
		[ 'the post editor', [ 'post-new-php', 'post-type-post' ] ],
	] as const )( 'loads on %s', async ( _label, bodyClasses ) => {
		document.body.classList.add( ...bodyClasses );
		const { amToolProvider } = await load();

		await expect( amToolProvider.getAbilities() ).resolves.toHaveLength(
			await ownedAbilityCount()
		);
	} );

	it( 'stays closed on a custom-post-type editor screen', async () => {
		document.body.classList.add( 'post-php', 'post-type-product' );
		const { amToolProvider } = await load();

		await expect( ownedAbilityNames( amToolProvider ) ).resolves.toEqual(
			ALL_SURFACE_ABILITY_NAMES
		);
	} );

	it( 'registers on the first load even when the provider triggers it', async () => {
		setEditorPage( true );
		const { amToolProvider, registerAbility } = await load();

		await amToolProvider.getAbilities();

		// Registration runs fire-and-forget with the load — let it settle.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( registerAbility ).toHaveBeenCalledTimes( await editorAbilityCount() );
	} );

	it( 'loads on the first execution, with no prior call', async () => {
		setEditorPage( true );
		mockShowComponentCallback.mockResolvedValueOnce( { result: { success: true } } );
		const { amToolProvider } = await load();

		await expect( amToolProvider.executeAbility( 'big_sky__show_component', {} ) ).resolves.toEqual(
			{ result: { success: true } }
		);
	} );

	it( 'skips loading with `?am_abilities=0`, keeping the all-surface abilities', async () => {
		setEditorPage( true );
		window.history.replaceState( {}, '', '/?am_abilities=0' );
		const { registerAmAbilities, amToolProvider, registerAbility } = await load();

		await registerAmAbilities();

		expect( registerAbility ).not.toHaveBeenCalled();
		await expect( ownedAbilityNames( amToolProvider ) ).resolves.toEqual(
			ALL_SURFACE_ABILITY_NAMES
		);
	} );

	it( 'stops advertising checkpoints when `?am_abilities=0` is set after a load', async () => {
		setEditorPage( true );
		jest.resetModules();
		jest.doMock( '../editor-abilities', () => ( {
			getEditorAbilities: () => [],
			registerEditorAbilities: jest.fn().mockResolvedValue( undefined ),
			getAvailableCheckpoints: () => [ { checkpointId: 'cp-1' } ],
		} ) );

		try {
			const { amToolProvider, getAmCheckpointContext } = await import( '..' );
			await amToolProvider.getAbilities();

			expect( getAmCheckpointContext() ).toHaveLength( 1 );

			window.history.replaceState( {}, '', '/?am_abilities=0' );

			expect( getAmCheckpointContext() ).toEqual( [] );
		} finally {
			jest.dontMock( '../editor-abilities' );
		}
	} );

	it( 'retries the load after a failed chunk fetch', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		setEditorPage( true );
		jest.resetModules();
		let attempt = 0;
		jest.doMock( '../editor-abilities', () => {
			attempt++;
			if ( attempt === 1 ) {
				throw new Error( 'Chunk failed.' );
			}
			return {
				getEditorAbilities: () => [ { name: 'big-sky/show-component' } ],
				registerEditorAbilities: jest.fn().mockResolvedValue( undefined ),
				getAvailableCheckpoints: () => [],
			};
		} );

		try {
			const { amToolProvider } = await import( '..' );

			await expect( ownedAbilityNames( amToolProvider ) ).resolves.toEqual(
				ALL_SURFACE_ABILITY_NAMES
			);
			await expect( amToolProvider.getAbilities() ).resolves.toHaveLength(
				ALL_SURFACE_ABILITY_NAMES.length + 1
			);
			expect( error ).toHaveBeenCalled();
		} finally {
			jest.dontMock( '../editor-abilities' );
		}
	} );

	it( 'never loads the editor abilities just to read the checkpoint context', async () => {
		setEditorPage( true );
		const { getAmCheckpointContext, registerAbility } = await load();

		expect( getAmCheckpointContext() ).toEqual( [] );
		// A load would resolve and register in a later task — let it settle.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( registerAbility ).not.toHaveBeenCalled();
	} );

	it( 'logs registration failures instead of throwing', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		setEditorPage( true );
		jest.resetModules();
		jest.doMock( '../editor-abilities', () => ( {
			getEditorAbilities: () => [],
			registerEditorAbilities: jest.fn().mockRejectedValue( new Error( 'Registration exploded.' ) ),
			getAvailableCheckpoints: () => [],
		} ) );

		try {
			const { registerAmAbilities } = await import( '..' );

			await expect( registerAmAbilities() ).resolves.toBeUndefined();
			// Registration runs fire-and-forget with the load — flush it.
			await Promise.resolve();
			expect( error ).toHaveBeenCalledWith(
				'[AgentsManager] Failed to register the editor abilities:',
				expect.any( Error )
			);
		} finally {
			jest.dontMock( '../editor-abilities' );
		}
	} );

	it( 'degrades to the all-surface abilities when the chunk fails to load', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		setEditorPage( true );
		jest.resetModules();
		jest.doMock( '../editor-abilities', () => {
			throw new Error( 'Chunk failed.' );
		} );

		try {
			const { registerAmAbilities, amToolProvider } = await import( '..' );

			await expect( registerAmAbilities() ).resolves.toBeUndefined();
			await expect( ownedAbilityNames( amToolProvider ) ).resolves.toEqual(
				ALL_SURFACE_ABILITY_NAMES
			);
			expect( error ).toHaveBeenCalledWith(
				'[AgentsManager] Failed to load the editor abilities:',
				expect.any( Error )
			);
		} finally {
			jest.dontMock( '../editor-abilities' );
		}
	} );
} );

describe( 'executeAbilityFromList', () => {
	const stubAbility = ( callback: jest.Mock ) => ( {
		name: 'big-sky/show-component',
		label: 'Show component',
		description: 'Stub ability',
		category: 'big-sky',
		callback,
	} );

	it( 'executes an ability by its normalized name', async () => {
		const callback = jest.fn().mockResolvedValue( { result: { success: true } } );

		await expect(
			executeAbilityFromList( [ stubAbility( callback ) ], 'big_sky__show_component', {} )
		).resolves.toEqual( { result: { success: true } } );
		expect( callback ).toHaveBeenCalledWith( {} );
	} );

	it( 'logs and rethrows when an ability fails', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const callback = jest.fn().mockRejectedValue( new Error( 'Callback exploded.' ) );

		await expect(
			executeAbilityFromList( [ stubAbility( callback ) ], 'big_sky__show_component', {} )
		).rejects.toThrow( 'Callback exploded.' );
		expect( error ).toHaveBeenCalledWith(
			'[AgentsManager] Ability "big_sky__show_component" failed:',
			expect.any( Error )
		);
	} );

	it( 'logs and rethrows for an unknown ability', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		await expect( executeAbilityFromList( [], 'big-sky/unknown', {} ) ).rejects.toThrow(
			'Agents Manager does not own the ability: big-sky/unknown'
		);
		expect( error ).toHaveBeenCalled();
	} );
} );

describe( 'registerEditorAbilities', () => {
	it( 'registers the category, then the abilities, exactly once', async () => {
		const { editorAbilities, registerAbility, registerAbilityCategory, unregisterAbility } =
			await load();

		await editorAbilities.registerEditorAbilities();
		await editorAbilities.registerEditorAbilities();

		expect( registerAbilityCategory ).toHaveBeenCalledTimes( 1 );
		expect( registerAbilityCategory ).toHaveBeenCalledWith( 'big-sky', expect.any( Object ) );

		expect( registerAbility ).toHaveBeenCalledTimes( editorAbilities.getEditorAbilities().length );
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'agents-manager/get-block-tree' } )
		);
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/restore-checkpoint' } )
		);
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/set-site-logo' } )
		);
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/show-component' } )
		);
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/show-template' } )
		);
		expect( registerAbilityCategory.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			registerAbility.mock.invocationCallOrder[ 0 ]
		);
		expect( unregisterAbility ).not.toHaveBeenCalled();
	} );

	it( 'replaces a provider copy when the name is already registered', async () => {
		const { editorAbilities, getAbility, registerAbility, unregisterAbility } = await load();
		// Whichever ability registers first: the collision is the mechanism
		// under test, not the list's order.
		const [ collidingAbility ] = editorAbilities.getEditorAbilities();
		registerAbility.mockRejectedValueOnce(
			new Error( `Ability "${ collidingAbility.name }" is already registered` )
		);
		getAbility.mockReturnValue( { name: collidingAbility.name } );

		await editorAbilities.registerEditorAbilities();

		expect( unregisterAbility ).toHaveBeenCalledWith( collidingAbility.name );
		// One extra call: the collision is retried after unregistering.
		expect( registerAbility ).toHaveBeenCalledTimes(
			editorAbilities.getEditorAbilities().length + 1
		);
	} );

	it( 'does not unregister when the failure is not a collision', async () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const { editorAbilities, getAbility, registerAbility, unregisterAbility } = await load();
		registerAbility.mockRejectedValueOnce( new Error( 'Invalid ability definition' ) );
		getAbility.mockReturnValue( undefined );

		await editorAbilities.registerEditorAbilities();

		expect( unregisterAbility ).not.toHaveBeenCalled();
		expect( registerAbility ).toHaveBeenCalledTimes( editorAbilities.getEditorAbilities().length );
		expect( warn ).toHaveBeenCalled();
		warn.mockRestore();
	} );
} );
