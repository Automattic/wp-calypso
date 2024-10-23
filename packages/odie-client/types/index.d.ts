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

declare module 'calypso/components/textarea-autosize' {
	const TextareaAutosize: FC< {
		placeholder: string;
		className: string;
		rows: number;
		value: string;
		onChange: ( event: React.ChangeEvent< HTMLTextAreaElement > ) => void;
		onKeyPress: ( event: KeyboardEvent< HTMLTextAreaElement > ) => Promise< void >;
	} >;

	export default TextareaAutosize;
}

declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUser: ( state: unknown ) => { display_name: string };
}

declare module 'calypso/components/async-load' {
	import { FC, ReactNode, ComponentType } from 'react';

	interface AsyncLoadProps {
		placeholder?: ReactNode;
		require: string;
		[ key: string ]: unknown;
	}

	const AsyncLoad: FC< AsyncLoadProps > & { component: ComponentType | null };

	export default AsyncLoad;
}
