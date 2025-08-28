type Props = {
	tld: string;
	addTldToFilter: ( tld: string ) => void;
};

export const FilterPopoverTld = ( { tld, addTldToFilter }: Props ) => {
	return (
		<button
			className="domain-search-controls__filters-popover-available-tld"
			key={ tld }
			onClick={ () => {
				addTldToFilter( tld );
			} }
		>
			{ tld }
		</button>
	);
};
