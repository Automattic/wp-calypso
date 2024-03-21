export type OfferingCardProps = {
	title: string;
	description: string;
	items?: OfferingItemProps[];
};

export type OfferingItemProps = {
	title: string;
	titleIcon: JSX.Element;
	description: string;
	highlights: string[];
	expanded: boolean;
	buttonTitle: string;
	actionHandler: () => void;
};
