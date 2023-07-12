import '@wordpress/components';

declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __experimentalDivider: React.ComponentType< Props >;
	export const __experimentalHStack: React.ComponentType< Props >;
	export const __experimentalVStack: React.ComponentType< Props >;

	export const __experimentalSpacer: React.ComponentType< Props >;
	export const __experimentalItem: React.ComponentType< Props >;
	export const __experimentalItemGroup: React.ComponentType< Props >;
	export const __experimentalNavigatorBackButton: React.ComponentType< Props >;
	export const __experimentalNavigatorButton: React.ComponentType< Props >;
	export const __experimentalNavigatorProvider: React.ComponentType< Props >;
	export const __experimentalNavigatorScreen: React.ComponentType< Props >;
	export const __unstableComposite: React.ComponentType< Props >;
	export const __unstableUseCompositeState: ( props?: {
		orientation?: 'horizontal' | 'vertical';
	} ) => any;
	export const __unstableCompositeItem: React.ComponentType< Props >;

	interface NavigatorLocation {
		path: string;
		isInitial: boolean;
		isBack: boolean;
	}

	export const __experimentalUseNavigator: () => {
		location: NavigatorLocation;
		goTo: ( path: string ) => void;
		goBack: () => void;
	};
}
