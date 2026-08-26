/**
 * Service for loading conversations from WordPress.com odie-assistant API
 */

import { logger } from '../client/utils/logger';
import { serverChatToLoadResult, ServerConversationError } from './serverTypes';
import type { ServerChat, ServerConversationListItem, ServerLoadResult } from './serverTypes';
import type { AuthProvider } from '../client/types/index';

export interface OdieServiceConfig {
	botId: string;
	apiBaseUrl?: string;
	authProvider?: AuthProvider;
}

export const DEFAULT_API_BASE_URL = 'https://public-api.wordpress.com';

/**
 * Load conversation messages from the server
 * @param chatId            - The chat/session ID to load
 * @param config            - Service configuration
 * @param pageNumber        - Page number to load (default: 1)
 * @param itemsPerPage      - Items per page (default: 50, max: 100)
 * @param allowToolMessages - When `true`, includes `tool_result` messages (default: `false`)
 */
export async function loadChatFromServer(
	chatId: string,
	config: OdieServiceConfig,
	pageNumber: number = 1,
	itemsPerPage: number = 50,
	allowToolMessages = false
): Promise< ServerLoadResult > {
	const { botId, apiBaseUrl = DEFAULT_API_BASE_URL, authProvider } = config;

	// Validate parameters
	if ( ! chatId || ! botId ) {
		throw new Error( 'chatId and botId are required to load conversation from server' );
	}

	// Ensure page number is within limits (API limits to 100 pages)
	const safePage = Math.max( 1, Math.min( pageNumber, 100 ) );
	const safeItemsPerPage = Math.max( 1, Math.min( itemsPerPage, 100 ) );

	// Build API URL
	const url = new URL(
		`${ apiBaseUrl }/wpcom/v2/odie/chat/${ encodeURIComponent( botId ) }/${ encodeURIComponent(
			chatId
		) }`
	);
	url.searchParams.set( 'page_number', safePage.toString() );
	url.searchParams.set( 'items_per_page', safeItemsPerPage.toString() );

	logger( 'Loading conversation from server: %s (page %d)', chatId, safePage );

	try {
		// Get auth headers if provider is available
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( authProvider ) {
			const authHeaders = await authProvider();
			Object.assign( headers, authHeaders );
		}

		// Make API request
		const response = await fetch( url.toString(), {
			method: 'GET',
			headers,
		} );

		// Handle errors
		if ( ! response.ok ) {
			const errorText = await response.text();
			let errorMessage = `Failed to load conversation from server: ${ response.status } ${ response.statusText }`;

			// Try to parse error response
			try {
				const errorJson = JSON.parse( errorText );
				if ( errorJson.message ) {
					errorMessage = errorJson.message;
				}
			} catch {
				// Ignore parse errors, use default message
			}

			const error = new ServerConversationError( errorMessage, response.status, errorText );

			logger( 'Failed to load conversation from server: %O', error );
			throw error;
		}

		// Parse response
		const serverChat: ServerChat = await response.json();

		// Transform to client format
		const result = serverChatToLoadResult( serverChat, allowToolMessages );

		logger(
			'Loaded %d messages from server (page %d/%d)',
			result.messages.length,
			result.pagination.currentPage,
			result.pagination.totalPages
		);

		return result;
	} catch ( error ) {
		if ( error instanceof ServerConversationError ) {
			throw error;
		}

		// Wrap other errors
		const wrappedError = new ServerConversationError(
			`Network error loading conversation: ${ ( error as Error ).message }`,
			undefined,
			error
		);

		logger( 'Network error loading conversation: %O', error );
		throw wrappedError;
	}
}

/**
 * List available conversations from server
 * Useful for testing and debugging - lists recent conversations for a bot
 * @param botId           - The bot ID to get conversations for
 * @param config          - Service configuration (omit botId, will use parameter)
 * @param useFirstMessage - If `true`, show first message as preview; if `false`, show last message (default: `false`)
 * @returns Array of conversation list items
 */
export async function listConversationsFromServer(
	botId: string,
	config: Omit< OdieServiceConfig, 'botId' >,
	useFirstMessage = false,
	channelFilter?: { externalIdProvider: string; externalId: string }
): Promise< ServerConversationListItem[] > {
	const { apiBaseUrl = DEFAULT_API_BASE_URL, authProvider } = config;

	// Build API URL
	const url = new URL(
		`${ apiBaseUrl }/wpcom/v2/odie/conversations/${ encodeURIComponent( botId ) }`
	);

	url.searchParams.set( 'truncation_method', useFirstMessage ? 'first_message' : 'last_message' );

	// Optional server-side channel filter (narrowing-only; user scoping always applies first).
	if ( channelFilter ) {
		url.searchParams.set( 'external_id_provider', channelFilter.externalIdProvider );
		url.searchParams.set( 'external_id', channelFilter.externalId );
	}

	logger( 'Listing conversations from server for bot: %s', botId );

	try {
		// Get auth headers if provider is available
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( authProvider ) {
			const authHeaders = await authProvider();
			Object.assign( headers, authHeaders );
		}

		// Make API request
		const response = await fetch( url.toString(), {
			method: 'GET',
			headers,
		} );

		// Handle errors
		if ( ! response.ok ) {
			const errorText = await response.text();
			const errorMessage = `Failed to list conversations: ${ response.status } ${ response.statusText }`;
			const error = new ServerConversationError( errorMessage, response.status, errorText );
			logger( 'Failed to list conversations: %O', error );
			throw error;
		}

		// Parse response
		const conversations = await response.json();

		logger( 'Loaded %d conversations from server', conversations.length );

		return conversations;
	} catch ( error ) {
		if ( error instanceof ServerConversationError ) {
			throw error;
		}

		const wrappedError = new ServerConversationError(
			`Network error listing conversations: ${ ( error as Error ).message }`,
			undefined,
			error
		);
		logger( 'Network error listing conversations: %O', error );
		throw wrappedError;
	}
}

/**
 * Load multiple pages of messages and combine them
 * Useful for loading entire conversation history
 * @param chatId            - The chat/session ID to load
 * @param config            - Service configuration
 * @param maxPages          - Maximum number of pages to load (default: 10)
 * @param allowToolMessages - When `true`, includes `tool_result` messages (default: `false`)
 */
export async function loadAllMessagesFromServer(
	chatId: string,
	config: OdieServiceConfig,
	maxPages: number = 10,
	allowToolMessages = false
): Promise< ServerLoadResult > {
	// Load first page to get pagination info
	const firstPage = await loadChatFromServer( chatId, config, 1, 50, allowToolMessages );

	// If there's only one page, return it
	if ( ! firstPage.pagination.hasMore ) {
		return firstPage;
	}

	// Calculate how many more pages to load
	const totalPagesToLoad = Math.min( firstPage.pagination.totalPages, maxPages );
	const allMessages = [ ...firstPage.messages ];

	// Load remaining pages in parallel (up to maxPages)
	const pagePromises: Promise< ServerLoadResult >[] = [];
	for ( let page = 2; page <= totalPagesToLoad; page++ ) {
		pagePromises.push( loadChatFromServer( chatId, config, page, 50, allowToolMessages ) );
	}

	try {
		const additionalPages = await Promise.all( pagePromises );

		for ( const pageResult of additionalPages ) {
			allMessages.push( ...pageResult.messages );
		}

		return {
			messages: allMessages,
			pagination: {
				...firstPage.pagination,
				currentPage: totalPagesToLoad,
				hasMore: totalPagesToLoad < firstPage.pagination.totalPages,
			},
			chatId: firstPage.chatId,
		};
	} catch ( error ) {
		logger( 'Failed to load all pages: %O', error );
		// Return what we have so far
		return {
			messages: allMessages,
			pagination: firstPage.pagination,
			chatId: firstPage.chatId,
		};
	}
}
