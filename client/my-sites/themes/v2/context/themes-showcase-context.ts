import { createContext } from 'react';

export type ThemesShowcaseContext = {
	category: string;
	setCategory: ( category: string ) => void;
	filter: string;
	setFilter: ( filter: string ) => void;
	tier: string;
	setTier: ( tier: string ) => void;
	search: string;
	setSearch: ( search: string ) => void;
	vertical: string;
	setVertical: ( vertical: string ) => void;
	canonicalUrl: string;
	setCanonicalUrl: ( canonicalUrl: string ) => void;
};

const defaultContext: ThemesShowcaseContext = {
	category: 'recommended',
	setCategory: () => {},
	filter: '',
	setFilter: () => {},
	tier: '',
	setTier: () => {},
	search: '',
	setSearch: () => {},
	vertical: '',
	setVertical: () => {},
	canonicalUrl: '',
	setCanonicalUrl: () => {},
};

const ThemesShowcaseContext: React.Context< ThemesShowcaseContext > =
	createContext( defaultContext );

export default ThemesShowcaseContext;
