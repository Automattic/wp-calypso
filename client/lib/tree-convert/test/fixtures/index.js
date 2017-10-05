/** @format */
export const menusFlat = {
	menus: [
		{
			id: 1,
			name: 'Menu 1',
			items: [
				{ id: 1, name: 'Home', order: 1, parent: 0 },
				{ id: 2, name: 'About us', order: 3, parent: 0 },
				{ id: 3, name: 'Products', order: 2, parent: 0 },
				{ id: 4, name: 'Slippers', order: 2, parent: 3 },
				{ id: 5, name: 'Socks', order: 1, parent: 3 },
				{ id: 6, name: 'Stripy socks', order: 1, parent: 5 },
				{ id: 7, name: '80s socks', order: 2, parent: 5 },
				{ id: 8, name: 'Location', order: 1, parent: 2 },
				{ id: 9, name: 'Space invader designs', order: 1, parent: 7 },
			],
			locations: [ 'primary' ],
		},
		{
			id: 2,
			name: 'Menu 2 &amp;c.',
			items: [
				{ id: 1, name: 'Item 21 &amp; counting', order: 1 },
				{ id: 2, name: 'Item 22', order: 2 },
				{ id: 3, name: 'Item 23', order: 3 },
			],
			locations: null,
		},
		{
			id: 3,
			name: 'Menu 3',
			description: 'The third menu is dull &amp; boring',
			items: [
				{ id: 1, name: 'Item 31', order: 1 },
				{ id: 2, name: 'Item 32', order: 2 },
				{ id: 3, name: 'Item 33', order: 3 },
			],
			locations: [ 'secondary' ],
		},
	],
	locations: [
		{ name: 'primary', description: 'Top &amp; Primary Menu' },
		{ name: 'secondary', description: 'Secondary menu in left sidebar' },
		{ name: 'social&amp;lite', description: 'Social Menu' },
	],
};

export const menuBadParent = {
	id: 4,
	name: 'Menu 4',
	items: [
		{ id: 1, name: 'Home', order: 1, parent: 0 },
		{ id: 2, name: 'About us', order: 3, parent: 666 },
		{ id: 3, name: 'Products', order: 2, parent: 0 },
		{ id: 4, name: 'Slippers', order: 2, parent: 3 },
	],
	locations: [ 'primary' ],
};
