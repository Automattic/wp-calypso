export interface OmnibarNode {
	id: string;
	title: string;
	icon?: React.ReactElement;
	group?: boolean;
	href?: string;
	onClick?: () => void;
	meta?: SiteActionNodeMeta & UserInfoNodeMeta;
	render?: ( node: OmnibarNode ) => React.ReactNode;
	children?: OmnibarNode[];
}

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
	plugins?: OmnibarNode[];
	user?: OmnibarNode;
}

export interface OmnibarProps {
	nodes: OmnibarNodes;
	onClickResponsiveMenu?: () => void;
}
