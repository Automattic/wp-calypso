declare module '@wordpress/keyboard-shortcuts' {
	type ShortcutProts = { children: JSX.Element };
	export function ShortcutProvider( props: ShortcutProts ): JSX.Element;
}
