declare module '@automattic/site-picker' {
	type Site = {
		ID: number;
		URL: string;
		name: string;
		logo: { id: string; sizes: []; url: string };
	};

	type Props = {
		selectedSiteId: number | undefined;
		options: Site[];
		onPickSite: ( siteId: number ) => void;
	};

	export function SitePickerDropDown( props: Props ): JSX.Element;
}
