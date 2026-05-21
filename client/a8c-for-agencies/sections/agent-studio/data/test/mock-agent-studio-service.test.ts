/**
 * @jest-environment jsdom
 */
import { mockAgentStudioService } from '../mock-agent-studio-service';

const briefInput = {
	agentId: 'one-pager',
	agentName: 'June',
	deliverableType: 'One-pager',
	title: 'Client launch one-pager',
	description: 'A leave-behind for the pitch.',
};

describe( 'mockAgentStudioService default project', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'creates the default project when listing outputs before any exist', async () => {
		const outputs = await mockAgentStudioService.listOutputs();
		expect( outputs ).toEqual( [] );

		const projects = await mockAgentStudioService.listProjects();
		expect( projects.filter( ( project ) => project.isDefault ) ).toHaveLength( 1 );
	} );

	it( 'routes new outputs into a single shared default project', async () => {
		await mockAgentStudioService.createOutput( briefInput );
		await mockAgentStudioService.createOutput( {
			...briefInput,
			agentId: 'social-assets',
			agentName: 'Iris',
		} );

		const defaultProjects = ( await mockAgentStudioService.listProjects() ).filter(
			( project ) => project.isDefault
		);
		expect( defaultProjects ).toHaveLength( 1 );

		const outputs = await mockAgentStudioService.listOutputs();
		expect( outputs ).toHaveLength( 2 );
		expect( outputs.every( ( output ) => output.projectId === defaultProjects[ 0 ].id ) ).toBe(
			true
		);
	} );

	it( 'starts every created output in the generating state', async () => {
		const output = await mockAgentStudioService.createOutput( briefInput );
		expect( output.status ).toBe( 'generating' );
	} );

	it( 'resolves a generating deliverable to ready after the generation window', async () => {
		jest.useFakeTimers();
		try {
			jest.setSystemTime( new Date( '2026-05-19T10:00:00Z' ) );
			await mockAgentStudioService.createOutput( briefInput );

			const [ stillGenerating ] = await mockAgentStudioService.listOutputs();
			expect( stillGenerating.status ).toBe( 'generating' );

			jest.setSystemTime( new Date( '2026-05-19T10:00:10Z' ) );
			const [ resolved ] = await mockAgentStudioService.listOutputs();
			expect( resolved.status ).toBe( 'ready' );
			expect( resolved.previewUrls?.length ).toBeGreaterThan( 0 );
			expect( resolved.assetCount ).toBeGreaterThan( 0 );
		} finally {
			jest.useRealTimers();
		}
	} );

	it( 'removes a deliverable from the list when deleted', async () => {
		const output = await mockAgentStudioService.createOutput( briefInput );
		await mockAgentStudioService.deleteOutput( output.id );

		expect( await mockAgentStudioService.listOutputs() ).toEqual( [] );
	} );
} );
