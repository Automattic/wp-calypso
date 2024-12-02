export interface MarketingToolsFeatureData {
	title: string;
	description: string;
	categories: string[];
	imagePath: string;
	imageAlt?: string;
	buttonText: string;
	buttonHref?: string;
	buttonTarget?: '_blank';
	onClick?: () => void;
}
