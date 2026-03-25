import type { ReactNode } from 'react';

type RenderItemProps< T > = {
	item: T;
	context: 'dropdown' | 'list';
};

export type RenderItemMedia< T > = ( props: RenderItemProps< T > & { size?: number } ) => ReactNode;

export type RenderItemTitle< T > = ( props: RenderItemProps< T > ) => ReactNode;

export type RenderItemDescription< T > = ( props: RenderItemProps< T > ) => ReactNode;
