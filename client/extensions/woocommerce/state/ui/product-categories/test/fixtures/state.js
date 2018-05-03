/** @format */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

const categories = [
	{ id: 1, name: 'cat1', slug: 'cat-1', parent: 0 },
	{ id: 2, name: 'cat2', slug: 'cat-2', parent: 0 },
	{ id: 3, name: 'cat3', slug: 'cat-3', parent: 2 },
	{ id: 4, name: 'cat4', slug: 'cat-4', parent: 3 },
	{ id: 5, name: 'cat5', slug: 'cat-5', parent: 0 },
	{ id: 6, name: 'cat6', slug: 'cat-6', parent: 0 },
];

const site1 = {
	isQueryLoading: {
		'{}': false,
	},
	items: {
		1: categories[ 0 ],
		2: categories[ 1 ],
	},
	queries: {
		'{}': [ 1, 2 ],
	},
	total: {
		'{}': 6,
	},
	totalPages: {
		'{}': 2,
	},
};

const site2 = {
	isQueryLoading: {
		'{}': false,
	},
	items: {
		5: categories[ 4 ],
		6: categories[ 5 ],
	},
	queries: {
		'{}': [ 5, 6 ],
	},
	total: {
		'{}': 4,
	},
	totalPages: {
		'{}': 2,
	},
};

const site3 = {
	isQueryLoading: {
		'{}': false,
		'{"page":2}': false,
	},
	items: keyBy( categories, 'id' ),
	queries: {
		'{}': [ 1, 2, 3, 4, 5 ],
		'{"page":2}': [ 6 ],
	},
	total: {
		'{}': 6,
	},
	totalPages: {
		'{}': 2,
	},
};

export default {
	ui: { selectedSiteId: 'site.one' },
	extensions: {
		woocommerce: {
			sites: {
				'site.one': {
					productCategories: site1,
				},
				'site.two': {
					productCategories: site2,
				},
				'site.three': {
					productCategories: site3,
				},
			},
			ui: {
				productCategories: {
					'site.one': {
						edits: {
							currentlyEditingId: 2,
							updates: [
								{
									id: 2,
									name: 'new name',
								},
							],
						},
					},
					'site.two': {
						edits: {
							currentlyEditingId: { placeholder: 'productCategory_1' },
							creates: [
								{
									id: { placeholder: 'productCategory_1' },
									label: 'test1',
									name: 'test1',
								},
							],
						},
					},
				},
			},
		},
	},
};
