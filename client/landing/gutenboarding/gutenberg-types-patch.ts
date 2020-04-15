declare module '@wordpress/compose' {
	type breakpoint = 'huge' | 'wide' | 'large' | 'medium' | 'small' | 'mobile';
	type operator = '>=' | '<';
	export function useViewportMatch( viewport: breakpoint, operator?: operator ): boolean;
}

declare module '@wordpress/element' {
	export function createInterpolateElement(
		interpolatedString: string,
		conversionMap: Record< string, ReactElement >
	): ReactNode;
}

export {};
