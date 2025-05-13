import '@tanstack/react-router';

declare module '@tanstack/react-router' {
	interface StaticDataRouteOption {
		breadcrumbItemLabel?: () => string;
	}
}
