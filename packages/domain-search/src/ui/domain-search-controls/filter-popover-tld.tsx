import { __experimentalText as Text } from '@wordpress/components';

type Props = {
	tld: string;
	addTldToFilter: ( tld: string ) => void;
};

export const FilterPopoverTld = ( { tld, addTldToFilter }: Props ) => {
	return (
		<Text
			className="domain-search-controls__filters-popover-available-tld"
			isBlock
			key={ tld }
			role="button"
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
