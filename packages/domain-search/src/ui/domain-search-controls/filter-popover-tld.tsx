import { __experimentalText as Text } from '@wordpress/components';

type Props = {
	tld: string;
	addTldToFilter: ( tld: string ) => void;
};

export const FilterPopoverTld = ( { tld, addTldToFilter }: Props ) => {
	return (
		<Text
			as="button"
			className="domain-search-controls__filters-popover-available-tld"
			isBlock
			key={ tld }
			role="option"
			tabIndex={ 0 }
			size="small"
			lineHeight="1.5"
			onClick={ () => {
				addTldToFilter( tld );
			} }
		>
			{ tld }
		</Text>
	);
};
