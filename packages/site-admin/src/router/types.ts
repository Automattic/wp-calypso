import type { ReactNode } from 'react';

export type BeforeNavigate = ( arg: { path: string; query: Record< string, any > } ) => {
	path: string;
	query: Record< string, any >;
};

export interface Config {
	pathArg: string;
	beforeNavigate?: BeforeNavigate;
}

export interface Match {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
	query?: Record< string, any >;
	params?: Record< string, any >;
}

export type LocationWithQuery = Location & {
	query?: Record< string, any >;
};

export interface Route {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
}
