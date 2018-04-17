/** @format */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

const categories = [
	{ id: 1, name: 'cat1', slug: 'cat-1' },
	{ id: 2, name: 'cat2', slug: 'cat-2' },
	{ id: 3, name: 'cat3', slug: 'cat-3' },
	{ id: 4, name: 'cat4', slug: 'cat-4' },
	{ id: 5, name: 'cat5', slug: 'cat-5' },
	{ id: 6, name: 'cat6', slug: 'cat-6' },
];

const site1 = {
	isQueryLoading: {},
	items: [],
	queries: {},
	total: {},
	totalPages: {},
};

const site4 = {
	isQueryLoading: {
		'{}': true,
	},
	items: [],
	queries: {},
	total: {},
	totalPages: {},
};

const site2 = {
	isQueryLoading: {
		'{}': false,
		'{"page":2}': true,
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
		'site.four': {
			productCategories: site4,
		},
	},
};
