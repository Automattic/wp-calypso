import React from 'react';
import type { links } from './table/links';
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

export type ProductToCompare = {
	id: 'FREE' | 'SECURITY' | 'COMPLETE' | 'GROWTH';
	name: React.ReactNode;
	productSlug: string;
};

type TLinks = typeof links;

// This little TS magic ensures that we use the correct URL for a given product ID.
type IdUrlPairs< T > = {
	[ K in keyof T ]: {
		id: K;
		url: T[ K ];
	};
}[ keyof T ];

type Feature = {
	name: React.ReactNode;
	icon?: string;
	info: {
		[ K in ProductToCompare[ 'id' ] ]?: {
			content: React.ReactNode;
			highlight?: boolean;
		};
	};
} & IdUrlPairs< TLinks >;

export type ComparisonDataItem = {
	sectionId: string;
	sectionName: React.ReactNode;
	icon?: string;
	features: Array< Feature >;
};

export type TableWithStoreContextProps = {
	locale?: string;
	urlQueryArgs: QueryArgs;
	rootUrl: string;
};

export type ContentProps = TableWithStoreContextProps & {
	nav: React.ReactNode;
	header: React.ReactNode;
	footer: React.ReactNode;
};
