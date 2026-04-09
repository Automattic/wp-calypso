import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';
import { AgentticMessage, ZendeskMessage } from './types';

export const SUPPORTED_IMAGE_TYPES = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ];
export const MAX_ATTACHMENTS = 5;

export function isSupportedImageType( type: string ) {
	return SUPPORTED_IMAGE_TYPES.includes( type );
}

let smoochContainer: HTMLDivElement | null = null;

export function getSmoochContainer(): HTMLDivElement | null {
	if ( typeof document === 'undefined' ) {
		return null;
	}

	const existing = document.querySelector< HTMLDivElement >( '.smooch-container' );
	if ( existing ) {
		smoochContainer = existing;
	} else if ( ! smoochContainer ) {
		smoochContainer = document.createElement( 'div' );
		smoochContainer.className = 'smooch-container';
	}

	// Keep the container hidden since we're using embedded mode.
	smoochContainer.style.display = 'none';
	smoochContainer.style.position = 'absolute';
	smoochContainer.style.top = '0';
	smoochContainer.style.left = '0';
	smoochContainer.style.width = '100%';
	smoochContainer.style.height = '100%';
	smoochContainer.style.zIndex = '1000';

	if ( ! document.body.contains( smoochContainer ) ) {
		document.body.appendChild( smoochContainer );
	}

	return smoochContainer;
}

export const playNotificationSound = () => {
	if ( typeof window === 'undefined' ) {
		return;
	}

	// @ts-expect-error expected because of fallback webkitAudioContext
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if ( ! AudioContextClass ) {
		return;
	}

	try {
		const audioContext = new AudioContextClass();
		const duration = 0.7;
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		// Configure oscillator
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime( 660, audioContext.currentTime );

		// Configure gain for a smoother fade-out
		gainNode.gain.setValueAtTime( 0.3, audioContext.currentTime );
		gainNode.gain.exponentialRampToValueAtTime( 0.001, audioContext.currentTime + duration );

		// Connect & start
		oscillator.connect( gainNode );
		gainNode.connect( audioContext.destination );
		oscillator.start();
		oscillator.stop( audioContext.currentTime + duration );
	} catch {
		// Audio playback is not available in this environment
	}
};

export const isTestModeEnvironment = () => {
	// `env_id` may not be set in all environments (e.g., Gutenberg plugin context).
	// `config()` throws in development and returns `undefined` in production when the key is missing.
	let envId: string | undefined;
	try {
		envId = config( 'env_id' );
	} catch ( error ) {
		// `env_id` not configured in this environment; fall through to `env` check below
		// eslint-disable-next-line no-console
		console.warn( '[isTestModeEnvironment] failed to read `env_id` from config', error );
	}

	// During SU sessions, we want to always target prod. See HAL-154.
	if ( isInSupportSession() ) {
		return false;
	}

	// In the Calypso SPA context, env_id follows the config file convention and ends with
	// 'development', 'horizon', or 'stage' (e.g. 'dashboard-stage', 'jetpack-cloud-horizon').
	// In the widgets.wp.com bundle context (apps/help-center, apps/agents-manager), config.js
	// sets env_id to 'staging' for proxied/dev users. Both map to test mode.
	const testEnvironmentSuffixes = [ 'development', 'horizon', 'stage', 'staging' ];
	const isTestEnvironment = testEnvironmentSuffixes.some(
		( suffix ) => envId === suffix || envId?.endsWith( `-${ suffix }` )
	);

	if ( isTestEnvironment ) {
		return true;
	}

	// If env is production and it's not a test environment, treat it as production
	let env: string | undefined;
	try {
		env = config( 'env' );
	} catch ( error ) {
		// `env` not configured in this environment
		// eslint-disable-next-line no-console
		console.warn( '[isTestModeEnvironment] failed to read `env` from config', error );
	}

	// If `env` is not configured, default to production to avoid routing customers to staging.
	return env !== undefined && env !== 'production';
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
