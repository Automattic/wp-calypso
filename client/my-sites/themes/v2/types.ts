import * as React from 'react';

export enum Category {
	RECOMMENDED = 'recommended',
	ALL = 'all',
	DEFAULT = Category.RECOMMENDED,
}
export enum Tier {
	ALL = 'all',
	FREE = 'free',
	DEFAULT = Tier.ALL,
}

export type TierOption = {
	value: string;
	label: React.ReactElement | string | number;
};

export type ThemeOption = {
	action: ( themeId: string, siteId?: number ) => void;
	hideForTheme: ( themeId: string, siteId?: number ) => boolean;
};

const isCategory = ( value: string | null ): value is Category =>
	Object.values( Category ).includes( value as Category );

const categoryFromString = ( str: string ): Category | undefined =>
	Object.values( Category ).find( ( value ) => value === str );

export { isCategory, categoryFromString };
