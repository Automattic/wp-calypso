declare module '@automattic/viewport-react' {
	export const useMobileBreakpoint: () => boolean;
	export const useDesktopBreakpoint: () => boolean;
	export const useBreakpoint: ( breakpoint: string ) => boolean;
}
