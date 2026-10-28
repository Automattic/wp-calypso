import type { AdminBarNode } from './admin-bar';

export interface OmnibarNode {
	id: string;
	title?: string;
	label?: string;
	tooltip?: string;
	icon?: React.ReactElement;
	group?: boolean;
	variant?: 'secondary';
	href?: string;
	target?: string;
	rel?: string;
	onClick?: ( event: React.MouseEvent ) => void;
	onView?: () => void;
	disabled?: boolean;
	active?: boolean;
	className?: string;
	meta?: UserInfoNodeMeta;
	render?: ( node: OmnibarNode ) => React.ReactNode;
	children?: OmnibarNode[];
}

export type OmnibarNodeBuilders = Record<
	string,
	( adminBarNode: AdminBarNode ) => Partial< OmnibarNode > | null
>;

export type OmnibarHrefResolver = ( href: string ) => string;

export type OmnibarNodeTransformer = ( node: OmnibarNode ) => OmnibarNode;

export interface UserInfoNodeMeta {
	displayName?: string;
	username?: string;
}

export interface OmnibarNodes {
	home?: OmnibarNode;
	site?: OmnibarNode;
	siteNodes?: OmnibarNode[];
	userNodes?: OmnibarNode[];
	user?: OmnibarNode;
}

export interface OmnibarProps {
	nodes: OmnibarNodes;
	onClickResponsiveMenu?: () => void;
	className?: string;
}
