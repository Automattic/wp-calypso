export type OfferingCardProps = {
	title: string;
	description: string;
	items?: OfferingItemProps[];
	children?: React.ReactNode;
};

export type OfferingItemProps = {
	title: string;
	titleIcon: JSX.Element;
	description: string;
	highlights: string[];
	expanded?: boolean;
	clickableHeader?: boolean;
	buttonTitle: string;
	actionHandler: () => void;
	href?: string;
};
