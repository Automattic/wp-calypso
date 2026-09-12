/**
 * The menu entries that open a modal rather than navigating. The modals
 * themselves are ported separately.
 */
export type AddNewSiteAction =
	| 'import-from-wpcom'
	| 'a4a-connection'
	| 'jetpack-connection'
	| 'dev-site-configurations';

export interface AddNewSiteProps {
	onSelectAction: ( action: AddNewSiteAction ) => void;
}
