/**
 * The menu entries that open a modal rather than navigating. The import and
 * dev-site modals are ported separately.
 */
export type AddNewSiteAction =
	| 'import-from-wpcom'
	| 'a4a-connection'
	| 'jetpack-connection'
	| 'dev-site-configurations';

/** The actions handled by ConnectSiteModal: remotely installing a plugin on an existing site. */
export type ConnectSiteAction = Extract<
	AddNewSiteAction,
	'a4a-connection' | 'jetpack-connection'
>;

export interface AddNewSiteProps {
	onSelectAction: ( action: AddNewSiteAction ) => void;
}
