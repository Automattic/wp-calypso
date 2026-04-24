export interface OmnibarNode {
	id: string;
	title: string;
	group?: boolean;
	href?: string;
	children?: OmnibarNode[];
	render?: ( props: OmnibarNodeRenderProps ) => React.ReactElement;
}

export interface OmnibarNodeRenderProps {
	node: OmnibarNode;
}

export interface OmnibarNodes {
	home?: OmnibarNode;
	user?: OmnibarNode;
}

export interface OmnibarProps {
	nodes: OmnibarNodes;
}
