declare module '@automattic/components' {
	type Props = {
		className?: string;
		size?: { width: number; height: number };
	};

	export const WordPressWordmark: React.FunctionComponent< Props >;
}

declare module 'calypso/state/current-user/selectors' {
	export const isUserLoggedIn: ( state: unknown ) => boolean;
}
