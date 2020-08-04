export type FeaturesItem = {
	icon?: string;
	text: string;
	description?: string;
};

export type FeaturesMoreLink = {
	url: string;
	label: string;
};

export type Features = {
	items: FeaturesItem[] | { [ category: string ]: FeaturesItem[] };
	more?: FeaturesMoreLink;
};
