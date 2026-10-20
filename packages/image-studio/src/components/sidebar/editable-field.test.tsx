/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock dependencies - MUST be before imports that use them
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { addNotice: jest.fn(), setHasUpdatedMetadata: jest.fn() } ),
	useSelect: () => false,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

// Both agenttic packages ship ESM only, which jest can't resolve, so the mocks are virtual.
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		useAgentChat: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		RegenerateIcon: () => null,
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		label,
		icon,
		size,
		...props
	}: React.ButtonHTMLAttributes< HTMLButtonElement > & {
		label?: string;
		icon?: unknown;
		size?: string;
	} ) => <button { ...props } aria-label={ label } />,
	TextControl: () => null,
	TextareaControl: () => null,
} ) );

jest.mock( '../../hooks/use-agent-config', () => ( {
	useAgentConfig: jest.fn(),
} ) );

jest.mock( '../../hooks/use-error-notice', () => ( {
	useErrorNotice: jest.fn(),
} ) );

jest.mock( '../../utils/agent-config', () => ( {
	defaultAgentConfigFactory: {},
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioGenAIButtonClick: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

// Import after mocks
import { useAgentChat, type TaskUpdate } from '@automattic/agenttic-client';
import { useAgentConfig } from '../../hooks/use-agent-config';
import { MetadataField } from '../../types';
import { trackImageStudioGenAIButtonClick } from '../../utils/tracking';
import { EditableField, type RegenerateCredits } from './editable-field';

const mockUseAgentChat = useAgentChat as jest.Mock;
const mockUseAgentConfig = useAgentConfig as jest.Mock;

describe( 'EditableField Regenerate', () => {
	const onSubmit = jest.fn();
	const agentConfig = { agentId: 'wp-orchestrator', onTaskUpdate: jest.fn() };

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseAgentConfig.mockReturnValue( agentConfig );
		mockUseAgentChat.mockReturnValue( { onSubmit, isProcessing: false, error: null } );
	} );

	const renderField = ( credits?: RegenerateCredits ) =>
		render(
			<EditableField
				label="Alt Text"
				value=""
				onSave={ jest.fn() }
				field={ MetadataField.AltText }
				attachmentId={ 7 }
				credits={ credits }
			/>
		);

	it( 'sends the prompt when there are credits left', async () => {
		renderField( { onTaskUpdate: jest.fn(), beforeSubmit: () => true } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );

		expect( onSubmit ).toHaveBeenCalledWith( 'Generate a new alt text for this image' );
		expect( trackImageStudioGenAIButtonClick ).toHaveBeenCalled();
	} );

	it( 'sends nothing at zero credits, so the credits details open instead', async () => {
		const beforeSubmit = jest.fn( () => false );
		renderField( { onTaskUpdate: jest.fn(), beforeSubmit } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );

		expect( beforeSubmit ).toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( trackImageStudioGenAIButtonClick ).not.toHaveBeenCalled();
	} );

	it( 'passes the regeneration’s turn updates to the shared credits balance', () => {
		const onTaskUpdate = jest.fn();
		renderField( { onTaskUpdate, beforeSubmit: () => true } );

		const update = { id: 'task', final: true, status: { state: 'completed' }, text: '' };
		mockUseAgentChat.mock.calls[ 0 ][ 0 ].onTaskUpdate( update as TaskUpdate );

		expect( onTaskUpdate ).toHaveBeenCalledWith( update );
		expect( agentConfig.onTaskUpdate ).toHaveBeenCalledWith( update );
	} );

	it( 'still regenerates outside the modal, where there are no shared credits', async () => {
		renderField();

		await userEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );

		expect( onSubmit ).toHaveBeenCalled();
	} );
} );
