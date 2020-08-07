declare module '@wordpress/compose' {
	type breakpoint = 'huge' | 'wide' | 'large' | 'medium' | 'small' | 'mobile';
	type operator = '>=' | '<';
	export function useViewportMatch( viewport: breakpoint, operator?: operator ): boolean;
}

declare module '@wordpress/components' {
	const Tip: React.ComponentType< { children: React.ReactNode } >;
}

export {};
