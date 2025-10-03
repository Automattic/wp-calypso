import { __experimentalText as Text } from '@wordpress/components';

type Props = {
	text: string;
};

export const FilterPopoverLabel = ( { text }: Props ) => {
	return (
		<Text
			className="domain-search-controls__filters-popover-list-label"
			isBlock
			key={ text }
			role="presentation"
			size="small"
			weight="bold"
		>
			{ text }
		</Text>
	);
};
