import '@testing-library/jest-dom';
import { useAgentChat } from '@automattic/agenttic-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch, useSelect } from '@wordpress/data';
import { MetadataField } from '../../types';
import { EditableField } from './editable-field';

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		useAgentChat: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		label,
		onClick,
		disabled,
	}: {
		label: string;
		onClick?: () => void;
		disabled?: boolean;
	} ) => <button aria-label={ label } onClick={ onClick } disabled={ disabled } />,
	TextControl: ( {
		label: _label,
		__nextHasNoMarginBottom: _nextHasNoMarginBottom,
		...props
	}: { label?: string; __nextHasNoMarginBottom?: boolean } & React.ComponentProps< 'input' > ) => (
		<input { ...props } />
	),
	TextareaControl: ( {
		label: _label,
		__nextHasNoMarginBottom: _nextHasNoMarginBottom,
		...props
	}: {
		label?: string;
		__nextHasNoMarginBottom?: boolean;
	} & React.ComponentProps< 'textarea' > ) => <textarea { ...props } />,
} ) );

jest.mock( '../../hooks/use-agent-config', () => ( {
	useAgentConfig: () => ( { agentId: 'wp-orchestrator' } ),
} ) );

jest.mock( '../../hooks/use-error-notice', () => ( {
	useErrorNotice: jest.fn(),
} ) );

jest.mock( '../../utils/agent-config', () => ( {
	defaultAgentConfigFactory: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioGenAIButtonClick: jest.fn(),
} ) );

const mockUseAgentChat = useAgentChat as jest.Mock;
const mockUseDispatch = useDispatch as jest.Mock;
const mockUseSelect = useSelect as jest.Mock;
const mockRecordAgentRequestSettled = jest.fn();

describe( 'EditableField Agent request settlement', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( {
			addNotice: jest.fn(),
			recordAgentRequestSettled: mockRecordAgentRequestSettled,
			setHasUpdatedMetadata: jest.fn(),
		} );
		mockUseSelect.mockImplementation( ( selector ) =>
			selector( () => ( { getHasUpdatedMetadata: () => false } ) )
		);
	} );

	it( 'records settlement after metadata generation completes', async () => {
		let resolveRequest: () => void = () => {};
		const request = new Promise< void >( ( resolve ) => {
			resolveRequest = resolve;
		} );
		const onSubmit = jest.fn().mockReturnValue( request );
		mockUseAgentChat.mockReturnValue( { error: null, isProcessing: false, onSubmit } );

		render(
			<EditableField
				label="Alt Text"
				value=""
				onSave={ jest.fn() }
				field={ MetadataField.AltText }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Regenerate' ) );
		expect( onSubmit ).toHaveBeenCalledWith( 'Generate a new alt text for this image' );
		expect( mockRecordAgentRequestSettled ).not.toHaveBeenCalled();

		resolveRequest();
		await waitFor( () => expect( mockRecordAgentRequestSettled ).toHaveBeenCalledTimes( 1 ) );
	} );
} );
