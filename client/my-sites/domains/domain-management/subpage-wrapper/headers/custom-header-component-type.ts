export type CustomHeaderComponentType = React.ComponentType< {
	selectedDomainName: string;
	selectedSiteSlug: string;
	context?: string;
	inSiteContext?: boolean;
} >;
