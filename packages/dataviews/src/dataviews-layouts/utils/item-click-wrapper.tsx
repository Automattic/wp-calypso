/**
 * External dependencies
 */
import type { ReactNode, ReactElement, ComponentProps } from 'react';

function getClickableItemProps< Item >( {
	item,
	isItemClickable,
	onClickItem,
	className,
}: {
	item: Item;
	isItemClickable: ( item: Item ) => boolean;
	onClickItem?: ( item: Item ) => void;
	className?: string;
} ) {
	if ( ! isItemClickable( item ) || ! onClickItem ) {
		return { className };
	}

	return {
		className: className
			? `${ className } ${ className }--clickable`
			: undefined,
		role: 'button',
		tabIndex: 0,
		onClick: ( event: React.MouseEvent ) => {
			// Prevents onChangeSelection from triggering.
			event.stopPropagation();
			onClickItem( item );
		},
		onKeyDown: ( event: React.KeyboardEvent ) => {
			if (
				event.key === 'Enter' ||
				event.key === '' ||
				event.key === ' '
			) {
				// Prevents onChangeSelection from triggering.
				event.stopPropagation();
				onClickItem( item );
			}
		},
	};
}

export function ItemClickWrapper< Item >( {
	item,
	isItemClickable,
	onClickItem,
	renderItemLink,
	className,
	children,
	...extraProps
}: {
	item: Item;
	isItemClickable: ( item: Item ) => boolean;
	onClickItem?: ( item: Item ) => void;
	renderItemLink?: (
		props: {
			item: Item;
		} & ComponentProps< 'a' >
	) => ReactElement;
	className?: string;
	children: ReactNode;
} ) {
	if ( ! isItemClickable( item ) ) {
		return children;
	}

	// If we have a renderItemLink, use it
	if ( renderItemLink ) {
		return renderItemLink( {
			item,
			className: `${ className } ${ className }--clickable`,
			...extraProps,
			children,
		} );
	}

	// Otherwise use the classic click handler approach
	const clickProps = getClickableItemProps( {
		item,
		isItemClickable,
		onClickItem,
		className,
	} );

	return (
		<div { ...clickProps } { ...extraProps }>
			{ children }
		</div>
	);
}
