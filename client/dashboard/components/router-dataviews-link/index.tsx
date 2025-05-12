import { Link } from '@tanstack/react-router';
import type { ComponentProps } from 'react';

export function createRouterDataViewsLink< Item >(
	getLinkProps: ( item: Item ) => ComponentProps< typeof Link >
) {
	function DataViewsLink( { item, ...props }: { item: Item } & ComponentProps< 'a' > ) {
		const linkProps = getLinkProps( item );
		return <Link { ...linkProps } { ...props } />;
	}
	return DataViewsLink;
}
