import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';
import { AgentticMessage, ZendeskMessage } from './types';

const IS_TEST_MODE_ENVIRONMENT = true;
const IS_PRODUCTION_ENVIRONMENT = false;
const PRODUCTION_ENVIRONMENTS = [
	'desktop',
	'production',
	'wpcalypso',
	'jetpack-cloud-production',
	'a8c-for-agencies-production',
	'dashboard-production',
];

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;

	// During SU sessions, we want to always target prod. See HAL-154.
	if ( isInSupportSession() ) {
		return IS_PRODUCTION_ENVIRONMENT;
	}

	// If the environment is set to production, we return the production environment.
	if ( PRODUCTION_ENVIRONMENTS.includes( currentEnvironment ) ) {
		return IS_PRODUCTION_ENVIRONMENT;
	}

	// If the environment is not set to production, we return the test mode environment.
	return IS_TEST_MODE_ENVIRONMENT;
};

export const getBadRatingReasons = () => {
	if ( isTestModeEnvironment() ) {
		return [
			{ label: __( 'No reason provided', __i18n_text_domain__ ), value: '' },
			{ label: __( 'It took too long to get a reply.', __i18n_text_domain__ ), value: '1001' },
			{ label: __( 'The product cannot do what I want.', __i18n_text_domain__ ), value: '1002' },
			{ label: __( 'The issue was not resolved.', __i18n_text_domain__ ), value: '1003' },
			{ label: __( 'The Happiness Engineer was unhelpful.', __i18n_text_domain__ ), value: '1004' },
		];
	}

	return [
		{ label: __( 'No reason provided', __i18n_text_domain__ ), value: '' },
		{ label: __( 'It took too long to get a reply.', __i18n_text_domain__ ), value: '1000' },
		{ label: __( 'The product cannot do what I want.', __i18n_text_domain__ ), value: '1001' },
		{ label: __( 'The issue was not resolved.', __i18n_text_domain__ ), value: '1002' },
		{ label: __( 'The Happiness Engineer was unhelpful.', __i18n_text_domain__ ), value: '1003' },
	];
};

/**
 * Converts a ZendeskMessage to the agenttic-ui Message interface format
 * Used for components that require the standardized Message interface
 * @param message - The Zendesk message to convert
 * @returns An AgentticMessage compatible with the agenttic-ui components
 */
export const convertZendeskMessageToAgentticFormat = (
	message: ZendeskMessage
): AgentticMessage => {
	// Convert role: 'business' maps to 'agent', everything else to 'user'
	const role = message.role === 'business' && ! ( 'sendStatus' in message ) ? 'agent' : 'user';

	// Build content array based on message type
	const content: AgentticMessage[ 'content' ] = [];

	switch ( message.type ) {
		case 'text': {
			// Handle text content - prefer htmlText over text
			const textContent = message.htmlText || message.text || '';
			content.push( {
				type: 'text',
				text: textContent,
			} );
			break;
		}

		case 'image':
		case 'image-placeholder':
			// Handle image content
			if ( message.mediaUrl ) {
				content.push( {
					type: 'image_url',
					image_url: message.mediaUrl,
				} );
			}
			// Include alt text if available
			if ( message.altText ) {
				content.push( {
					type: 'text',
					text: message.altText,
				} );
			}
			break;

		case 'file': {
			// Handle file attachments as text links
			if ( message.mediaUrl ) {
				const fileName = message.mediaUrl.split( '/' ).pop()?.split( '?' )[ 0 ] || 'file';
				content.push( {
					type: 'text',
					text: `📎 ${ message.altText || fileName }`,
				} );
			}
			break;
		}

		default:
			// For unsupported types, add the text if available
			if ( message.text ) {
				content.push( {
					type: 'text',
					text: message.text,
				} );
			}
	}

	// If no content was added, provide a fallback
	if ( content.length === 0 ) {
		content.push( {
			type: 'text',
			text: '',
		} );
	}

	return {
		id: message.id || crypto.randomUUID(),
		role,
		content,
		timestamp: message.received,
		archived: false,
		showIcon: true,
		icon: message.avatarUrl,
		actions: message.actions,
		disabled: false,
	};
};
