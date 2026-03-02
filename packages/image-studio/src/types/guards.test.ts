import {
	isMediaAttachment,
	isAttachmentRecord,
	isWPBlock,
	isBlockEditProps,
	isCoreDataDispatch,
	isBlockEditorDispatch,
	isSupportedImageFile,
	isBlob,
	isFile,
	isErrorPayload,
	isGenerationSuccess,
	isGenerationError,
	isGenerationResult,
	isImageGenerationRequest,
	isImageEditRequest,
	isGenerationRequest,
	isJobState,
	isIdleOperationState,
	isProcessingOperationState,
	isSuccessOperationState,
	isErrorOperationState,
	isOperationState,
} from './guards';

// ── Shared null/primitive rejection cases ───────────────────────────

const NON_OBJECTS = [ null, undefined, 0, '', false, 42, 'string', true, Symbol(), [] ];

// ── Fixtures ────────────────────────────────────────────────────────

const validMediaAttachment = {
	id: 123,
	source_url: 'https://example.com/image.jpg',
	link: 'https://example.com/?attachment_id=123',
	mime_type: 'image/jpeg',
};

const validAttachmentRecord = {
	id: 456,
	source_url: 'https://example.com/photo.png',
	date: '2026-01-15T12:00:00',
};

const validWPBlock = {
	name: 'core/image',
	clientId: 'abc-123',
};

const validBlockEditProps = {
	name: 'core/image',
	clientId: 'abc-123',
	isSelected: true,
	attributes: { id: 1 },
	setAttributes: jest.fn(),
};

const validErrorPayload = {
	category: 'network',
	message: 'Request failed',
	timestamp: Date.now(),
};

const validGenerationSuccess = {
	status: 'success' as const,
	attachmentId: 789,
	imageUrl: 'https://example.com/generated.jpg',
};

const validGenerationError = {
	status: 'error' as const,
	error: { ...validErrorPayload },
};

const validImageGenerationRequest = {
	type: 'generate' as const,
	sessionId: 'sess-001',
	prompt: 'sunset over ocean',
};

const validImageEditRequest = {
	type: 'edit' as const,
	sessionId: 'sess-002',
	prompt: 'remove background',
	attachmentId: 100,
};

const validJobState = {
	jobId: 'job-001',
	status: 'processing',
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

// ── isMediaAttachment ───────────────────────────────────────────────

describe( 'isMediaAttachment', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isMediaAttachment( value ) ).toBe( false );
	} );

	it( 'accepts valid attachment', () => {
		expect( isMediaAttachment( validMediaAttachment ) ).toBe( true );
	} );

	it( 'accepts with optional fields', () => {
		expect(
			isMediaAttachment( {
				...validMediaAttachment,
				alt_text: 'A photo',
				title: { rendered: 'Photo', raw: 'Photo' },
				media_details: { width: 800, height: 600 },
			} )
		).toBe( true );
	} );

	it( 'rejects missing id', () => {
		const { id, ...rest } = validMediaAttachment;
		expect( isMediaAttachment( rest ) ).toBe( false );
	} );

	it( 'rejects missing source_url', () => {
		const { source_url, ...rest } = validMediaAttachment;
		expect( isMediaAttachment( rest ) ).toBe( false );
	} );

	it( 'rejects missing link', () => {
		const { link, ...rest } = validMediaAttachment;
		expect( isMediaAttachment( rest ) ).toBe( false );
	} );

	it( 'rejects missing mime_type', () => {
		const { mime_type, ...rest } = validMediaAttachment;
		expect( isMediaAttachment( rest ) ).toBe( false );
	} );

	it( 'rejects wrong types', () => {
		expect( isMediaAttachment( { ...validMediaAttachment, id: '123' } ) ).toBe( false );
		expect( isMediaAttachment( { ...validMediaAttachment, source_url: 42 } ) ).toBe( false );
	} );
} );

// ── isAttachmentRecord ──────────────────────────────────────────────

describe( 'isAttachmentRecord', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isAttachmentRecord( value ) ).toBe( false );
	} );

	it( 'accepts valid record', () => {
		expect( isAttachmentRecord( validAttachmentRecord ) ).toBe( true );
	} );

	it( 'rejects missing id', () => {
		const { id, ...rest } = validAttachmentRecord;
		expect( isAttachmentRecord( rest ) ).toBe( false );
	} );

	it( 'rejects missing source_url', () => {
		const { source_url, ...rest } = validAttachmentRecord;
		expect( isAttachmentRecord( rest ) ).toBe( false );
	} );

	it( 'rejects missing date', () => {
		const { date, ...rest } = validAttachmentRecord;
		expect( isAttachmentRecord( rest ) ).toBe( false );
	} );

	it( 'rejects wrong id type', () => {
		expect( isAttachmentRecord( { ...validAttachmentRecord, id: '456' } ) ).toBe( false );
	} );
} );

// ── isWPBlock ───────────────────────────────────────────────────────

describe( 'isWPBlock', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isWPBlock( value ) ).toBe( false );
	} );

	it( 'accepts valid block', () => {
		expect( isWPBlock( validWPBlock ) ).toBe( true );
	} );

	it( 'accepts block with extra properties', () => {
		expect( isWPBlock( { ...validWPBlock, attributes: { url: 'test' }, innerBlocks: [] } ) ).toBe(
			true
		);
	} );

	it( 'rejects missing name', () => {
		expect( isWPBlock( { clientId: 'abc' } ) ).toBe( false );
	} );

	it( 'rejects missing clientId', () => {
		expect( isWPBlock( { name: 'core/image' } ) ).toBe( false );
	} );

	it( 'rejects wrong types', () => {
		expect( isWPBlock( { name: 123, clientId: 'abc' } ) ).toBe( false );
	} );
} );

// ── isBlockEditProps ────────────────────────────────────────────────

describe( 'isBlockEditProps', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isBlockEditProps( value ) ).toBe( false );
	} );

	it( 'accepts valid props', () => {
		expect( isBlockEditProps( validBlockEditProps ) ).toBe( true );
	} );

	it( 'rejects missing isSelected', () => {
		const { isSelected, ...rest } = validBlockEditProps;
		expect( isBlockEditProps( rest ) ).toBe( false );
	} );

	it( 'rejects missing attributes', () => {
		const { attributes, ...rest } = validBlockEditProps;
		expect( isBlockEditProps( rest ) ).toBe( false );
	} );

	it( 'rejects missing setAttributes', () => {
		const { setAttributes, ...rest } = validBlockEditProps;
		expect( isBlockEditProps( rest ) ).toBe( false );
	} );

	it( 'rejects non-function setAttributes', () => {
		expect( isBlockEditProps( { ...validBlockEditProps, setAttributes: 'not-a-fn' } ) ).toBe(
			false
		);
	} );

	it( 'rejects non-boolean isSelected', () => {
		expect( isBlockEditProps( { ...validBlockEditProps, isSelected: 1 } ) ).toBe( false );
	} );
} );

// ── isCoreDataDispatch ──────────────────────────────────────────────

describe( 'isCoreDataDispatch', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isCoreDataDispatch( value ) ).toBe( false );
	} );

	it( 'accepts valid dispatch', () => {
		expect(
			isCoreDataDispatch( {
				saveEntityRecord: jest.fn(),
				deleteEntityRecord: jest.fn(),
				invalidateResolution: jest.fn(),
			} )
		).toBe( true );
	} );

	it( 'rejects missing saveEntityRecord', () => {
		expect(
			isCoreDataDispatch( {
				deleteEntityRecord: jest.fn(),
				invalidateResolution: jest.fn(),
			} )
		).toBe( false );
	} );

	it( 'rejects missing deleteEntityRecord', () => {
		expect(
			isCoreDataDispatch( {
				saveEntityRecord: jest.fn(),
				invalidateResolution: jest.fn(),
			} )
		).toBe( false );
	} );

	it( 'rejects missing invalidateResolution', () => {
		expect(
			isCoreDataDispatch( {
				saveEntityRecord: jest.fn(),
				deleteEntityRecord: jest.fn(),
			} )
		).toBe( false );
	} );

	it( 'rejects non-function values', () => {
		expect(
			isCoreDataDispatch( {
				saveEntityRecord: 'not-fn',
				deleteEntityRecord: jest.fn(),
				invalidateResolution: jest.fn(),
			} )
		).toBe( false );
	} );
} );

// ── isBlockEditorDispatch ───────────────────────────────────────────

describe( 'isBlockEditorDispatch', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isBlockEditorDispatch( value ) ).toBe( false );
	} );

	it( 'accepts valid dispatch', () => {
		expect( isBlockEditorDispatch( { updateBlockAttributes: jest.fn() } ) ).toBe( true );
	} );

	it( 'rejects missing method', () => {
		expect( isBlockEditorDispatch( {} ) ).toBe( false );
	} );

	it( 'rejects non-function value', () => {
		expect( isBlockEditorDispatch( { updateBlockAttributes: 'nope' } ) ).toBe( false );
	} );
} );

// ── isSupportedImageFile ────────────────────────────────────────────

describe( 'isSupportedImageFile', () => {
	const supported = [ 'image/jpeg', 'image/png', 'image/webp' ];

	it( 'accepts supported MIME type', () => {
		const file = new File( [ '' ], 'test.jpg', { type: 'image/jpeg' } );
		expect( isSupportedImageFile( file, supported ) ).toBe( true );
	} );

	it( 'rejects unsupported MIME type', () => {
		const file = new File( [ '' ], 'test.gif', { type: 'image/gif' } );
		expect( isSupportedImageFile( file, supported ) ).toBe( false );
	} );

	it( 'rejects empty MIME type', () => {
		const file = new File( [ '' ], 'test', { type: '' } );
		expect( isSupportedImageFile( file, supported ) ).toBe( false );
	} );
} );

// ── isBlob / isFile ─────────────────────────────────────────────────

describe( 'isBlob', () => {
	it( 'accepts Blob', () => {
		expect( isBlob( new Blob( [ 'data' ] ) ) ).toBe( true );
	} );

	it( 'accepts File (subclass of Blob)', () => {
		expect( isBlob( new File( [ 'data' ], 'test.txt' ) ) ).toBe( true );
	} );

	it( 'rejects non-Blob', () => {
		expect( isBlob( 'not a blob' ) ).toBe( false );
		expect( isBlob( null ) ).toBe( false );
		expect( isBlob( {} ) ).toBe( false );
	} );
} );

describe( 'isFile', () => {
	it( 'accepts File', () => {
		expect( isFile( new File( [ 'data' ], 'test.txt' ) ) ).toBe( true );
	} );

	it( 'rejects plain Blob', () => {
		expect( isFile( new Blob( [ 'data' ] ) ) ).toBe( false );
	} );

	it( 'rejects non-File', () => {
		expect( isFile( 'not a file' ) ).toBe( false );
		expect( isFile( null ) ).toBe( false );
	} );
} );

// ── isErrorPayload ──────────────────────────────────────────────────

describe( 'isErrorPayload', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isErrorPayload( value ) ).toBe( false );
	} );

	it( 'accepts valid error payload', () => {
		expect( isErrorPayload( validErrorPayload ) ).toBe( true );
	} );

	it( 'accepts with optional fields', () => {
		expect( isErrorPayload( { ...validErrorPayload, code: 'ERR_NET', statusCode: 500 } ) ).toBe(
			true
		);
	} );

	it( 'rejects missing category', () => {
		const { category, ...rest } = validErrorPayload;
		expect( isErrorPayload( rest ) ).toBe( false );
	} );

	it( 'rejects missing message', () => {
		const { message, ...rest } = validErrorPayload;
		expect( isErrorPayload( rest ) ).toBe( false );
	} );

	it( 'rejects missing timestamp', () => {
		const { timestamp, ...rest } = validErrorPayload;
		expect( isErrorPayload( rest ) ).toBe( false );
	} );

	it( 'rejects wrong types', () => {
		expect( isErrorPayload( { ...validErrorPayload, timestamp: 'not-a-number' } ) ).toBe( false );
	} );
} );

// ── isGenerationSuccess ─────────────────────────────────────────────

describe( 'isGenerationSuccess', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isGenerationSuccess( value ) ).toBe( false );
	} );

	it( 'accepts valid success', () => {
		expect( isGenerationSuccess( validGenerationSuccess ) ).toBe( true );
	} );

	it( 'accepts with optional metadata', () => {
		expect(
			isGenerationSuccess( {
				...validGenerationSuccess,
				metadata: { width: 1024, height: 768 },
			} )
		).toBe( true );
	} );

	it( 'rejects wrong status', () => {
		expect( isGenerationSuccess( { ...validGenerationSuccess, status: 'error' } ) ).toBe( false );
	} );

	it( 'rejects missing attachmentId', () => {
		const { attachmentId, ...rest } = validGenerationSuccess;
		expect( isGenerationSuccess( rest ) ).toBe( false );
	} );

	it( 'rejects missing imageUrl', () => {
		const { imageUrl, ...rest } = validGenerationSuccess;
		expect( isGenerationSuccess( rest ) ).toBe( false );
	} );

	it( 'rejects string attachmentId', () => {
		expect( isGenerationSuccess( { ...validGenerationSuccess, attachmentId: '789' } ) ).toBe(
			false
		);
	} );
} );

// ── isGenerationError ───────────────────────────────────────────────

describe( 'isGenerationError', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isGenerationError( value ) ).toBe( false );
	} );

	it( 'accepts valid error', () => {
		expect( isGenerationError( validGenerationError ) ).toBe( true );
	} );

	it( 'rejects wrong status', () => {
		expect( isGenerationError( { ...validGenerationError, status: 'success' } ) ).toBe( false );
	} );

	it( 'rejects invalid error payload', () => {
		expect( isGenerationError( { status: 'error', error: { message: 'oops' } } ) ).toBe( false );
	} );

	it( 'rejects missing error', () => {
		expect( isGenerationError( { status: 'error' } ) ).toBe( false );
	} );
} );

// ── isGenerationResult ──────────────────────────────────────────────

describe( 'isGenerationResult', () => {
	it( 'accepts success', () => {
		expect( isGenerationResult( validGenerationSuccess ) ).toBe( true );
	} );

	it( 'accepts error', () => {
		expect( isGenerationResult( validGenerationError ) ).toBe( true );
	} );

	it( 'rejects invalid', () => {
		expect( isGenerationResult( { status: 'pending' } ) ).toBe( false );
		expect( isGenerationResult( null ) ).toBe( false );
	} );
} );

// ── isImageGenerationRequest ────────────────────────────────────────

describe( 'isImageGenerationRequest', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isImageGenerationRequest( value ) ).toBe( false );
	} );

	it( 'accepts valid request', () => {
		expect( isImageGenerationRequest( validImageGenerationRequest ) ).toBe( true );
	} );

	it( 'accepts with optional fields', () => {
		expect(
			isImageGenerationRequest( {
				...validImageGenerationRequest,
				style: 'photographic',
				aspectRatio: '16:9',
			} )
		).toBe( true );
	} );

	it( 'rejects wrong type', () => {
		expect( isImageGenerationRequest( { ...validImageGenerationRequest, type: 'edit' } ) ).toBe(
			false
		);
	} );

	it( 'rejects missing sessionId', () => {
		const { sessionId, ...rest } = validImageGenerationRequest;
		expect( isImageGenerationRequest( rest ) ).toBe( false );
	} );

	it( 'rejects missing prompt', () => {
		const { prompt, ...rest } = validImageGenerationRequest;
		expect( isImageGenerationRequest( rest ) ).toBe( false );
	} );
} );

// ── isImageEditRequest ──────────────────────────────────────────────

describe( 'isImageEditRequest', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isImageEditRequest( value ) ).toBe( false );
	} );

	it( 'accepts valid request', () => {
		expect( isImageEditRequest( validImageEditRequest ) ).toBe( true );
	} );

	it( 'rejects wrong type', () => {
		expect( isImageEditRequest( { ...validImageEditRequest, type: 'generate' } ) ).toBe( false );
	} );

	it( 'rejects missing attachmentId', () => {
		const { attachmentId, ...rest } = validImageEditRequest;
		expect( isImageEditRequest( rest ) ).toBe( false );
	} );

	it( 'rejects string attachmentId', () => {
		expect( isImageEditRequest( { ...validImageEditRequest, attachmentId: '100' } ) ).toBe( false );
	} );
} );

// ── isGenerationRequest ─────────────────────────────────────────────

describe( 'isGenerationRequest', () => {
	it( 'accepts generate request', () => {
		expect( isGenerationRequest( validImageGenerationRequest ) ).toBe( true );
	} );

	it( 'accepts edit request', () => {
		expect( isGenerationRequest( validImageEditRequest ) ).toBe( true );
	} );

	it( 'rejects invalid type', () => {
		expect( isGenerationRequest( { type: 'unknown', sessionId: 'x', prompt: 'y' } ) ).toBe( false );
	} );

	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isGenerationRequest( value ) ).toBe( false );
	} );
} );

// ── isJobState ──────────────────────────────────────────────────────

describe( 'isJobState', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isJobState( value ) ).toBe( false );
	} );

	it( 'accepts valid job state', () => {
		expect( isJobState( validJobState ) ).toBe( true );
	} );

	it( 'accepts with optional fields', () => {
		expect( isJobState( { ...validJobState, result: { url: 'test' }, progress: 50 } ) ).toBe(
			true
		);
	} );

	it( 'rejects missing jobId', () => {
		const { jobId, ...rest } = validJobState;
		expect( isJobState( rest ) ).toBe( false );
	} );

	it( 'rejects missing status', () => {
		const { status, ...rest } = validJobState;
		expect( isJobState( rest ) ).toBe( false );
	} );

	it( 'rejects missing createdAt', () => {
		const { createdAt, ...rest } = validJobState;
		expect( isJobState( rest ) ).toBe( false );
	} );

	it( 'rejects missing updatedAt', () => {
		const { updatedAt, ...rest } = validJobState;
		expect( isJobState( rest ) ).toBe( false );
	} );

	it( 'rejects wrong types', () => {
		expect( isJobState( { ...validJobState, jobId: 123 } ) ).toBe( false );
		expect( isJobState( { ...validJobState, createdAt: 'now' } ) ).toBe( false );
	} );
} );

// ── OperationState guards ───────────────────────────────────────────

describe( 'isIdleOperationState', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isIdleOperationState( value ) ).toBe( false );
	} );

	it( 'accepts idle', () => {
		expect( isIdleOperationState( { status: 'idle' } ) ).toBe( true );
	} );

	it( 'rejects other statuses', () => {
		expect( isIdleOperationState( { status: 'processing' } ) ).toBe( false );
		expect( isIdleOperationState( { status: 'success' } ) ).toBe( false );
		expect( isIdleOperationState( { status: 'error' } ) ).toBe( false );
	} );
} );

describe( 'isProcessingOperationState', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isProcessingOperationState( value ) ).toBe( false );
	} );

	it( 'accepts processing', () => {
		expect( isProcessingOperationState( { status: 'processing' } ) ).toBe( true );
	} );

	it( 'accepts with optional fields', () => {
		expect(
			isProcessingOperationState( { status: 'processing', source: 'gen', progress: 42 } )
		).toBe( true );
	} );

	it( 'rejects other statuses', () => {
		expect( isProcessingOperationState( { status: 'idle' } ) ).toBe( false );
	} );
} );

describe( 'isSuccessOperationState', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isSuccessOperationState( value ) ).toBe( false );
	} );

	it( 'accepts valid success state', () => {
		expect(
			isSuccessOperationState( {
				status: 'success',
				data: { result: 'ok' },
				completedAt: Date.now(),
			} )
		).toBe( true );
	} );

	it( 'rejects missing data', () => {
		expect( isSuccessOperationState( { status: 'success', completedAt: Date.now() } ) ).toBe(
			false
		);
	} );

	it( 'rejects missing completedAt', () => {
		expect( isSuccessOperationState( { status: 'success', data: 'ok' } ) ).toBe( false );
	} );

	it( 'rejects wrong status', () => {
		expect(
			isSuccessOperationState( {
				status: 'error',
				data: 'ok',
				completedAt: Date.now(),
			} )
		).toBe( false );
	} );

	it( 'accepts data as any truthy value', () => {
		expect(
			isSuccessOperationState( { status: 'success', data: 0, completedAt: Date.now() } )
		).toBe( true );
		expect(
			isSuccessOperationState( { status: 'success', data: '', completedAt: Date.now() } )
		).toBe( true );
		expect(
			isSuccessOperationState( { status: 'success', data: false, completedAt: Date.now() } )
		).toBe( true );
	} );
} );

describe( 'isErrorOperationState', () => {
	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isErrorOperationState( value ) ).toBe( false );
	} );

	it( 'accepts valid error state', () => {
		expect( isErrorOperationState( { status: 'error', error: validErrorPayload } ) ).toBe( true );
	} );

	it( 'rejects invalid error payload', () => {
		expect( isErrorOperationState( { status: 'error', error: { message: 'bad' } } ) ).toBe( false );
	} );

	it( 'rejects missing error', () => {
		expect( isErrorOperationState( { status: 'error' } ) ).toBe( false );
	} );

	it( 'rejects wrong status', () => {
		expect( isErrorOperationState( { status: 'idle', error: validErrorPayload } ) ).toBe( false );
	} );
} );

// ── isOperationState (union) ────────────────────────────────────────

describe( 'isOperationState', () => {
	it( 'accepts all four valid states', () => {
		expect( isOperationState( { status: 'idle' } ) ).toBe( true );
		expect( isOperationState( { status: 'processing' } ) ).toBe( true );
		expect( isOperationState( { status: 'success', data: 'ok', completedAt: Date.now() } ) ).toBe(
			true
		);
		expect( isOperationState( { status: 'error', error: validErrorPayload } ) ).toBe( true );
	} );

	it( 'rejects unknown status', () => {
		expect( isOperationState( { status: 'cancelled' } ) ).toBe( false );
	} );

	it.each( NON_OBJECTS )( 'rejects non-object: %p', ( value ) => {
		expect( isOperationState( value ) ).toBe( false );
	} );
} );
