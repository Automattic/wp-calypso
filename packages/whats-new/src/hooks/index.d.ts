declare module 'calypso/state/ui/selectors' {
	export const getSelectedSiteId: ( state: unknown ) => number;
	export const getSectionName: ( state: unknown ) => SectionName;
}
