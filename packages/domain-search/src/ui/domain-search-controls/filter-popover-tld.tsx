type Props = {
	tld: string;
	addTldToFilter: ( tld: string ) => void;
};

export const FilterPopoverTld = ( { tld, addTldToFilter }: Props ) => {
	return (
		<div
			className="domain-search-controls__filters-popover-available-tld"
			key={ tld }
			onClick={ () => {
				addTldToFilter( tld );
			} }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					addTldToFilter( tld );
				}
			} }
			role="button"
			tabIndex={ 0 }
		>
			{ tld }
		</div>
	);
};
