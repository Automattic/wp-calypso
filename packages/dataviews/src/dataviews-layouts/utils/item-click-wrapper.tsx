/**
 * External dependencies
 */
import type { ReactNode, ComponentProps } from 'react';

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
	LinkComponent,
	className,
	children,
	...extraProps
}: {
	item: Item;
	isItemClickable: ( item: Item ) => boolean;
	onClickItem?: ( item: Item ) => void;
	LinkComponent?: React.ComponentType<
		{
			item: Item;
		} & ComponentProps< 'a' >
	>;
	className?: string;
	children: ReactNode;
} ) {
	if ( ! isItemClickable( item ) ) {
		return <>{ children }</>;
	}

	// If we have a LinkComponent, use it
	if ( LinkComponent ) {
		return (
			<LinkComponent
				item={ item }
				className={
					className
						? `${ className } ${ className }--clickable`
						: undefined
				}
				{ ...extraProps }
			>
				{ children }
			</LinkComponent>
		);
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
