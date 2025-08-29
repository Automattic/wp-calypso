import { __experimentalText as Text } from '@wordpress/components';

type Props = {
	text: string;
};

export const FilterPopoverLabel = ( { text }: Props ) => {
	return (
		<Text
			key={ text }
			size="small"
			isBlock
			weight="bold"
			className="domain-search-controls__filters-popover-list-label"
			role="presentation"
		>
			{ text }
		</Text>
	);
};
