export interface OmnibarNode {
	id: string;
	title: string;
	icon?: React.ReactElement;
	group?: boolean;
	href?: string;
	children?: OmnibarNode[];
}

export interface OmnibarNodeRenderProps {
	node: OmnibarNode;
}

export interface OmnibarNodes {
	home?: OmnibarNode;
	site?: OmnibarNode;
	user?: OmnibarNode;
}

export interface OmnibarProps {
	nodes: OmnibarNodes;
}
