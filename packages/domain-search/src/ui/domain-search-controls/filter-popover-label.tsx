type Props = {
	text: string;
};

export const FilterPopoverLabel = ( { text }: Props ) => {
	return (
		<div
			className="domain-search-controls__filters-popover-list-label"
			key={ text }
			onKeyDown={ () => {} }
			role="presentation"
		>
			{ text }
		</div>
	);
};
