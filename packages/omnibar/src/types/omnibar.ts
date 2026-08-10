import type { AdminBarNode } from './admin-bar';

export interface OmnibarNode {
	id: string;
	title?: string;
	label?: string;
	icon?: React.ReactElement;
	group?: boolean;
	variant?: 'secondary';
	href?: string;
	onClick?: ( event: React.MouseEvent ) => void;
	disabled?: boolean;
	className?: string;
	meta?: SiteActionNodeMeta & UserInfoNodeMeta;
	render?: ( node: OmnibarNode ) => React.ReactNode;
	children?: OmnibarNode[];
}

export type OmnibarNodeBuilders = Record<
	string,
	( adminBarNode: AdminBarNode ) => Partial< OmnibarNode >
>;

export type OmnibarHrefResolver = ( href: string ) => string;

export interface SiteActionNodeMeta {
	subtitle?: string;
}

export interface UserInfoNodeMeta {
	displayName?: string;
	username?: string;
}

export interface OmnibarNodes {
	home?: OmnibarNode;
	site?: OmnibarNode;
	siteActions?: OmnibarNode[];
	sitePlugins?: OmnibarNode[];
	plugins?: OmnibarNode[];
	user?: OmnibarNode;
}

export interface OmnibarProps {
	nodes: OmnibarNodes;
	onClickResponsiveMenu?: () => void;
	className?: string;
}
