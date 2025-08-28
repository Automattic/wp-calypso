type Props = {
	text: string;
};

export const FilterPopoverLabel = ( { text }: Props ) => {
	return (
		<span
			className="domain-search-controls__filters-popover-list-label"
			key={ text }
			role="presentation"
		>
			{ text }
		</span>
	);
};
