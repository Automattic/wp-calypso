declare module '*.svg' {
	const content: string;
	export default content;
}

declare module 'calypso/components/ellipsis-menu' {
	const EllipsisMenu: FC< {
		popoverClassName?: string;
		position?: string;
		children: React.ReactNode;
	} >;

	export default EllipsisMenu;
}

declare module 'calypso/components/popover-menu/item' {
	const PopoverMenuItem: FC< {
		className?: string;
		onClick: ( event: React.MouseEvent< HTMLButtonElement > ) => void;
		children: React.ReactNode;
	} >;

	export default PopoverMenuItem;
}

declare module 'calypso/components/popover-menu' {
	const EllipsisMenu: FC< {
		popoverClassName?: string;
		position?: string;
		children: React.ReactNode;
	} >;

	export default EllipsisMenu;
}

declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUser: ( state: unknown ) => { display_name: string };
}

declare module 'calypso/components/async-load' {
	import { FC, ReactNode, ComponentType, FC } from 'react';

	interface AsyncLoadProps {
		placeholder?: ReactNode;
		require: string;
		[ key: string ]: unknown;
	}

	const AsyncLoad: FC< AsyncLoadProps > & { component: ComponentType | null };

	export default AsyncLoad;
}
