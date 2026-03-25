import type { ReactNode } from 'react';

export type RenderItemProps< T > = {
	item: T;
	context: 'dropdown' | 'list';
};

export type RenderItem< T > = ( props: RenderItemProps< T > ) => ReactNode;
