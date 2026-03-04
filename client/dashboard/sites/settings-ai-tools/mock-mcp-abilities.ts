/**
 * Mock MCP abilities for prototyping.
 *
 * When the API doesn't yet return `mcp_abilities` for a site, this module
 * provides realistic stub data persisted in localStorage so the UI is fully
 * interactive.
 *
 * Remove this file once the API ships site-level MCP abilities.
 */

import type { SiteMcpAbility } from '@automattic/api-core';

const STORAGE_KEY = 'dk_mock_mcp_abilities_v2';

type SiteMcpAbilities = Record< string, SiteMcpAbility >;

const DEFAULT_ABILITIES: SiteMcpAbilities = {
	// ── Read: Content ────────────────────────────────────────────────
	'wp-get-posts': {
		name: 'wp-get-posts',
		title: 'List posts',
		description: 'Retrieve all posts from your site with filtering and pagination.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-pages': {
		name: 'wp-get-pages',
		title: 'List pages',
		description: 'View all pages on your site and retrieve their content.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-media': {
		name: 'wp-get-media',
		title: 'List media',
		description: 'Browse the media library and view image, video, and file metadata.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-comments': {
		name: 'wp-get-comments',
		title: 'List comments',
		description: 'View all comments on your site with author, status, and date details.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-categories': {
		name: 'wp-get-categories',
		title: 'List categories',
		description: 'View all post categories and their hierarchy.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-tags': {
		name: 'wp-get-tags',
		title: 'List tags',
		description: 'View all tags used across your site content.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-search-content': {
		name: 'wp-search-content',
		title: 'Search content',
		description: 'Search across posts, pages, and media using keywords and filters.',
		category: 'content',
		category_label: 'Content',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	// ── Read: Site Configuration ─────────────────────────────────────
	'wp-get-site-settings': {
		name: 'wp-get-site-settings',
		title: 'Read site settings',
		description:
			'Access your site configuration including title, tagline, timezone, and permalink structure.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-themes': {
		name: 'wp-get-themes',
		title: 'List themes',
		description: 'View installed themes and the currently active theme.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-plugins': {
		name: 'wp-get-plugins',
		title: 'List plugins',
		description: 'View all installed plugins and their activation status.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-menus': {
		name: 'wp-get-menus',
		title: 'List menus',
		description: 'View navigation menus and their items.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-users': {
		name: 'wp-get-users',
		title: 'List users',
		description: 'View site users, their roles, and profile information.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	// ── Read: Design ─────────────────────────────────────────────────
	'wp-get-synced-patterns': {
		name: 'wp-get-synced-patterns',
		title: 'List synced patterns',
		description: 'View reusable block patterns saved on your site.',
		category: 'design',
		category_label: 'Design',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-templates': {
		name: 'wp-get-templates',
		title: 'List templates',
		description: 'View page and post templates used by your theme.',
		category: 'design',
		category_label: 'Design',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-global-styles': {
		name: 'wp-get-global-styles',
		title: 'Read global styles',
		description: 'Access your site-wide typography, colors, and layout settings.',
		category: 'design',
		category_label: 'Design',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	// ── Read: Analytics ──────────────────────────────────────────────
	'wp-get-stats': {
		name: 'wp-get-stats',
		title: 'View site stats',
		description: 'Access traffic data including views, visitors, and popular content.',
		category: 'analytics',
		category_label: 'Analytics',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	'wp-get-site-health': {
		name: 'wp-get-site-health',
		title: 'View site health',
		description: 'Check your site performance, security status, and recommended improvements.',
		category: 'analytics',
		category_label: 'Analytics',
		type: 'resource',
		enabled: true,
		annotations: { readonly: true, idempotent: true },
	},
	// ── Write: Content ───────────────────────────────────────────────
	'wp-create-post': {
		name: 'wp-create-post',
		title: 'Create a post',
		description: 'Create new posts on your site with title, content, and metadata.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: false },
	},
	'wp-update-post': {
		name: 'wp-update-post',
		title: 'Update a post',
		description: 'Edit existing posts including title, content, categories, and publish status.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	'wp-create-page': {
		name: 'wp-create-page',
		title: 'Create a page',
		description: 'Create new pages on your site with title, content, and template.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: false },
	},
	'wp-update-page': {
		name: 'wp-update-page',
		title: 'Update a page',
		description: 'Edit existing pages including content, template, and publish status.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	'wp-upload-media': {
		name: 'wp-upload-media',
		title: 'Upload media',
		description: 'Upload images, videos, and other files to the media library.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: false },
	},
	'wp-create-comment': {
		name: 'wp-create-comment',
		title: 'Create a comment',
		description: 'Add new comments or replies to posts on your site.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: false },
	},
	'wp-moderate-comment': {
		name: 'wp-moderate-comment',
		title: 'Moderate a comment',
		description: 'Approve, spam, or trash comments on your site.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	// ── Write: Site Configuration ────────────────────────────────────
	'wp-update-site-settings': {
		name: 'wp-update-site-settings',
		title: 'Update site settings',
		description:
			'Modify your site configuration including theme, visibility, and performance options.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	'wp-activate-theme': {
		name: 'wp-activate-theme',
		title: 'Activate a theme',
		description: 'Switch your site to a different installed theme.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	'wp-update-menu': {
		name: 'wp-update-menu',
		title: 'Update a menu',
		description: 'Add, remove, or reorder items in your navigation menus.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	// ── Write: Design ────────────────────────────────────────────────
	'wp-update-global-styles': {
		name: 'wp-update-global-styles',
		title: 'Update global styles',
		description: 'Change site-wide typography, colors, and layout settings.',
		category: 'design',
		category_label: 'Design',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	'wp-update-template': {
		name: 'wp-update-template',
		title: 'Update a template',
		description: 'Edit page and post templates used by your theme.',
		category: 'design',
		category_label: 'Design',
		type: 'action',
		enabled: false,
		annotations: { idempotent: true },
	},
	// ── Manage (destructive): Content ────────────────────────────────
	'wp-delete-post': {
		name: 'wp-delete-post',
		title: 'Delete a post',
		description: 'Permanently delete posts from your site. This action cannot be undone.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { destructive: true, idempotent: false },
	},
	'wp-delete-page': {
		name: 'wp-delete-page',
		title: 'Delete a page',
		description: 'Permanently delete pages from your site. This action cannot be undone.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { destructive: true, idempotent: false },
	},
	'wp-delete-media': {
		name: 'wp-delete-media',
		title: 'Delete media',
		description: 'Permanently remove images, videos, and files from the media library.',
		category: 'content',
		category_label: 'Content',
		type: 'action',
		enabled: false,
		annotations: { destructive: true, idempotent: false },
	},
	// ── Manage (destructive): Site Configuration ─────────────────────
	'wp-manage-plugins': {
		name: 'wp-manage-plugins',
		title: 'Manage plugins',
		description: 'Install, activate, deactivate, and delete plugins on your site.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'action',
		enabled: false,
		annotations: { destructive: true, idempotent: false },
	},
	'wp-delete-theme': {
		name: 'wp-delete-theme',
		title: 'Delete a theme',
		description: 'Remove an installed theme from your site.',
		category: 'site',
		category_label: 'Site Configuration',
		type: 'action',
		enabled: false,
		annotations: { destructive: true, idempotent: false },
	},
};

/** Load stubbed abilities from localStorage, falling back to defaults. */
export function getMockMcpAbilities(): SiteMcpAbilities {
	try {
		const stored = localStorage.getItem( STORAGE_KEY );
		if ( stored ) {
			return JSON.parse( stored ) as SiteMcpAbilities;
		}
	} catch {
		// Ignore parse errors — fall through to defaults.
	}
	return { ...DEFAULT_ABILITIES };
}

/** Persist updated abilities to localStorage and return the merged result. */
export function updateMockMcpAbilities( updates: Record< string, boolean > ): SiteMcpAbilities {
	const current = getMockMcpAbilities();
	Object.entries( updates ).forEach( ( [ toolId, enabled ] ) => {
		if ( current[ toolId ] ) {
			current[ toolId ] = { ...current[ toolId ], enabled };
		}
	} );
	localStorage.setItem( STORAGE_KEY, JSON.stringify( current ) );
	return current;
}
