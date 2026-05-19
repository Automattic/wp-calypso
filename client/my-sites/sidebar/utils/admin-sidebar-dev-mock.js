const MOCK_GROUP_ID = 'plugins';

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

function mockSignalForIndex( index ) {
	if ( index === 0 ) {
		return {
			count: 3,
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

export function buildAdminSidebarDevMock( menuItems ) {
	if ( ! Array.isArray( menuItems ) ) {
		return { menuItems: [], groups: [] };
	}

	let picked = 0;
	const mockedMenuItems = menuItems.map( ( item, index ) => {
		if (
			picked >= 3 ||
			item?.type === 'separator' ||
			item?.type === 'current-site' ||
			item?.children?.length ||
			isExemptItem( item )
		) {
			return item;
		}

		const itemId = `mock:menu:${ MOCK_GROUP_ID }:${ item.slug || `idx-${ index }` }`;
		const mocked = {
			...item,
			group_id: MOCK_GROUP_ID,
			itemId,
			reassignable: true,
			signal: mockSignalForIndex( picked ),
		};
		picked += 1;
		return mocked;
	} );

	return {
		menuItems: mockedMenuItems,
		groups:
			picked > 0
				? [
						{
							id: MOCK_GROUP_ID,
							label: 'My Plugins',
							default_expanded: false,
							signal: { attention: true, count: 3 },
						},
				  ]
				: [],
	};
}

export function applyAdminSidebarDevMock( menuItems, groups ) {
	if ( ! isAdminSidebarDevMockActive() ) {
		return { menuItems, groups };
	}
	return buildAdminSidebarDevMock( menuItems );
}
