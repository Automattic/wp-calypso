const MOCK_GROUP_ID = 'plugins';
const MOCK_ITEM_TARGET_COUNT = 3;

const MOCK_FALLBACK_ITEMS = [
	{
		slug: 'mock-plugin-forms',
		title: 'Forms',
		type: 'menu-item',
		url: '#mock-plugin-forms',
		icon: 'dashicons-feedback',
	},
	{
		slug: 'mock-plugin-seo',
		title: 'SEO',
		type: 'menu-item',
		url: '#mock-plugin-seo',
		icon: 'dashicons-chart-line',
	},
	{
		slug: 'mock-plugin-cache',
		title: 'Cache',
		type: 'menu-item',
		url: '#mock-plugin-cache',
		icon: 'dashicons-performance',
	},
];

const EXEMPT_SLUGS = new Set( [
	'home',
	'my-home',
	'dashboard',
	'posts',
	'edit.php',
	'pages',
	'edit.php?post_type=page',
	'media',
	'upload.php',
	'comments',
	'edit-comments.php',
	'themes',
	'appearance',
	'themes.php',
	'plugins',
	'plugins.php',
	'users',
	'people',
	'users.php',
	'tools',
	'tools.php',
	'settings',
	'options-general.php',
	'profile',
	'profile.php',
	'hosting',
	'upgrades',
	'plans',
	'plan',
	'domains',
] );

const EXEMPT_TITLES = new Set( [
	'my home',
	'home',
	'dashboard',
	'posts',
	'media',
	'pages',
	'comments',
	'appearance',
	'plugins',
	'users',
	'people',
	'tools',
	'settings',
	'profile',
	'upgrades',
	'plan',
	'plans',
	'domains',
	'hosting',
] );

export function isAdminSidebarDevMockActive() {
	if ( typeof window === 'undefined' || typeof window.location?.search !== 'string' ) {
		return false;
	}
	return new URLSearchParams( window.location.search ).get( 'adminSidebarMock' ) === '1';
}

function isExemptItem( item ) {
	if ( ! item ) {
		return true;
	}
	if ( item.slug && EXEMPT_SLUGS.has( item.slug ) ) {
		return true;
	}
	const title = typeof item.title === 'string' ? item.title.toLowerCase().trim() : '';
	return !! ( title && EXEMPT_TITLES.has( title ) );
}

function buildMockGroup( count ) {
	return {
		id: MOCK_GROUP_ID,
		label: 'My Plugins',
		default_expanded: false,
		signal: { attention: true, count },
	};
}

export function getAdminSidebarDevMockGroups() {
	return [ buildMockGroup( MOCK_ITEM_TARGET_COUNT ) ];
}

function mockSignalForIndex( index, count = MOCK_ITEM_TARGET_COUNT ) {
	if ( index === 0 ) {
		return {
			count,
			numeric_badge: null,
			badge: null,
			inline_text: null,
			inline_icon: null,
			attention: true,
		};
	}
	if ( index === 1 ) {
		return {
			count: null,
			numeric_badge: null,
			badge: null,
			inline_text: 'Premium',
			inline_icon: null,
			attention: false,
		};
	}
	return null;
}

function canUseItemAsMockSource( item ) {
	return item?.type !== 'separator' && item?.type !== 'current-site' && ! isExemptItem( item );
}

function normalizeExemptItem( item ) {
	if ( item?.group_id || item?.reassignable === true ) {
		return {
			...item,
			group_id: null,
			reassignable: false,
		};
	}
	return item;
}

function buildMockItem( item, sourceId, index, count ) {
	const slug = item.slug || `idx-${ sourceId }`;
	return {
		...item,
		group_id: MOCK_GROUP_ID,
		itemId: `mock:menu:${ MOCK_GROUP_ID }:${ slug }`,
		reassignable: true,
		signal: mockSignalForIndex( index, count ),
	};
}

export function buildAdminSidebarDevMock( menuItems ) {
	if ( ! Array.isArray( menuItems ) ) {
		return { menuItems: [], groups: [] };
	}

	let picked = 0;
	const mockedMenuItems = menuItems.map( ( item, index ) => {
		if ( isExemptItem( item ) ) {
			return normalizeExemptItem( item );
		}

		if ( picked >= MOCK_ITEM_TARGET_COUNT || ! canUseItemAsMockSource( item ) ) {
			return item;
		}

		const mocked = buildMockItem( item, index, picked, MOCK_ITEM_TARGET_COUNT );
		picked += 1;
		return mocked;
	} );

	for ( const item of MOCK_FALLBACK_ITEMS ) {
		if ( picked >= MOCK_ITEM_TARGET_COUNT ) {
			break;
		}
		mockedMenuItems.push( buildMockItem( item, item.slug, picked, MOCK_ITEM_TARGET_COUNT ) );
		picked += 1;
	}

	return {
		menuItems: mockedMenuItems,
		groups: picked > 0 ? [ buildMockGroup( picked ) ] : [],
	};
}

export function applyAdminSidebarDevMock( menuItems, groups ) {
	if ( ! isAdminSidebarDevMockActive() ) {
		return { menuItems, groups };
	}
	return buildAdminSidebarDevMock( menuItems );
}
