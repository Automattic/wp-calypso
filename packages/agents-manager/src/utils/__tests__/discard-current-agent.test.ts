/* eslint-disable import/order -- module mocks must be configured before the utility import */
const mockAgentManager = {
	hasAgent: jest.fn(),
	abortCurrentRequest: jest.fn(),
	removeAgent: jest.fn(),
};
const mockGetAgentManager = jest.fn( () => mockAgentManager );
let mockResolvedAgentId: string | undefined;

// Jest cannot resolve this declared package dependency in the source test environment.
jest.mock(
	'@automattic/agenttic-client',
	() => ( { getAgentManager: () => mockGetAgentManager() } ),
	{ virtual: true }
);
jest.mock( '../resolved-agent-id', () => ( {
	getResolvedAgentId: () => mockResolvedAgentId,
} ) );

import { discardCurrentAgentsManagerAgent } from '../discard-current-agent';

describe( 'discardCurrentAgentsManagerAgent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockResolvedAgentId = 'wp-orchestrator';
		mockAgentManager.hasAgent.mockReturnValue( true );
	} );

	it( 'aborts and removes the resolved live agent', () => {
		discardCurrentAgentsManagerAgent();

		expect( mockAgentManager.abortCurrentRequest ).toHaveBeenCalledWith( 'wp-orchestrator' );
		expect( mockAgentManager.removeAgent ).toHaveBeenCalledWith( 'wp-orchestrator' );
	} );

	it( 'does nothing before the agent id resolves', () => {
		mockResolvedAgentId = undefined;

		discardCurrentAgentsManagerAgent();

		expect( mockGetAgentManager ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when the resolved agent is not live', () => {
		mockAgentManager.hasAgent.mockReturnValue( false );

		discardCurrentAgentsManagerAgent();

		expect( mockAgentManager.abortCurrentRequest ).not.toHaveBeenCalled();
		expect( mockAgentManager.removeAgent ).not.toHaveBeenCalled();
	} );
} );
