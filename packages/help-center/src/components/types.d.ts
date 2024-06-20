// context here: https://wp.me/pbAok1-1Ao
declare const __i18n_text_domain__: string;
interface Window {
	helpCenterData: {
		currentSite: {
			ID: number;
			name: string;
			URL: string;
			plan: {
				product_slug: string;
			};
			is_wpcom_atomic: boolean;
			jetpack: boolean;
			site_intent: string;
			launchpad_screen: string;
			logo: {
				id: number;
				sizes: string[];
				url: string;
			};
		};
		admin_url: string;
	};
	zE?: (
		action: string,
		value: string,
		handler?:
			| ( ( callback: ( data: string | number ) => void ) => void )
			| { id: number; value: string }[]
	) => void;
}

declare module '*.jpg';
