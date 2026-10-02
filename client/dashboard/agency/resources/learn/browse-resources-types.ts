export type Product =
	| 'WordPress VIP'
	| 'Pressable'
	| 'Program'
	| 'WooCommerce'
	| 'WordPress.com'
	| 'Jetpack';

export type Stage = 'Learn' | 'Sell' | 'Manage' | 'Grow';

export type ContentType =
	| 'One-pager'
	| 'Battle card'
	| 'Talk track'
	| 'Reference guide'
	| 'Slide deck'
	| 'Webinar'
	| 'Blog'
	| 'Case study'
	| 'Checklist'
	| 'Guide';

export type Audience = 'All' | 'Developer' | 'Business' | 'Client';

export type PreviewType = 'pdf' | 'slides' | 'video' | 'doc';

export interface PrototypeResource {
	id: string;
	product: Product;
	stage: Stage;
	contentType: ContentType;
	audience: Audience;
	title: string;
	description: string;
	previewType: PreviewType;
	topResource?: boolean;
}
