/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock dependencies - MUST be before imports that use them
vi.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { addNotice: vi.fn(), setHasUpdatedMetadata: vi.fn() } ),
	useSelect: () => false,
} ) );

vi.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

// Both agenttic packages ship ESM only, which jest can't resolve, so the mocks are virtual.
vi.mock( '@automattic/agenttic-client', () => ( {
	useAgentChat: vi.fn(),
} ) );

vi.mock( '@automattic/agenttic-ui', () => ( {
	RegenerateIcon: () => null,
} ) );

vi.mock( '@wordpress/components', () => ( {
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

vi.mock( '../../hooks/use-agent-config', () => ( {
	useAgentConfig: vi.fn(),
} ) );

vi.mock( '../../hooks/use-error-notice', () => ( {
	useErrorNotice: vi.fn(),
} ) );

vi.mock( '../../utils/agent-config', () => ( {
	defaultAgentConfigFactory: {},
} ) );

vi.mock( '../../utils/tracking', () => ( {
	trackImageStudioGenAIButtonClick: vi.fn(),
} ) );

vi.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

// Import after mocks
import { useAgentChat, type TaskUpdate } from '@automattic/agenttic-client';
import { useAgentConfig } from '../../hooks/use-agent-config';
import { MetadataField } from '../../types';
import { trackImageStudioGenAIButtonClick } from '../../utils/tracking';
import { EditableField, type RegenerateCredits } from './editable-field';

const mockUseAgentChat = useAgentChat as Mock;
const mockUseAgentConfig = useAgentConfig as Mock;

describe( 'EditableField Regenerate', () => {
	const onSubmit = vi.fn();
	const agentConfig = { agentId: 'wp-orchestrator', onTaskUpdate: vi.fn() };

	beforeEach( () => {
		vi.clearAllMocks();
		mockUseAgentConfig.mockReturnValue( agentConfig );
		mockUseAgentChat.mockReturnValue( { onSubmit, isProcessing: false, error: null } );
	} );

	const renderField = ( credits?: RegenerateCredits ) =>
		render(
			<EditableField
				label="Alt Text"
				value=""
				onSave={ vi.fn() }
				field={ MetadataField.AltText }
				attachmentId={ 7 }
				credits={ credits }
			/>
		);

	it( 'sends the prompt when there are credits left', async () => {
		renderField( { onTaskUpdate: vi.fn(), beforeSubmit: () => true } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );

		expect( onSubmit ).toHaveBeenCalledWith( 'Generate a new alt text for this image' );
		expect( trackImageStudioGenAIButtonClick ).toHaveBeenCalled();
	} );

	it( 'sends nothing at zero credits, so the credits details open instead', async () => {
		const beforeSubmit = vi.fn( () => false );
		renderField( { onTaskUpdate: vi.fn(), beforeSubmit } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );

		expect( beforeSubmit ).toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( trackImageStudioGenAIButtonClick ).not.toHaveBeenCalled();
	} );

	it( 'passes the regeneration’s turn updates to the shared credits balance', () => {
		const onTaskUpdate = vi.fn();
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
