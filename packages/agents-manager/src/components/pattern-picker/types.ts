export interface BlockData {
	name: string;
	clientId?: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: BlockData[];
}

export interface Pattern {
	blocks: BlockData[];
	category?: string;
}

export interface Layout {
	id: string;
	patterns: Pattern[];
	isPlaceholder?: boolean;
	resolvers?: Array< { resolver: Promise< unknown > } >;
}
