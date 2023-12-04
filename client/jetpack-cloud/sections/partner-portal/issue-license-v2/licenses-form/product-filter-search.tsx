import { useTranslate } from 'i18n-calypso';
import Search from 'calypso/components/search';

type Props = {
	onProductSearch: ( value: string ) => void;
};

export default function ProductFilterSearch( { onProductSearch }: Props ) {
	const translate = useTranslate();

	return (
		<div className="licenses-form__product-filter-search">
			<Search
				onSearch={ onProductSearch }
				placeholder={ translate( 'Search plans, products, add-ons, and extensions' ) }
				compact
				hideFocus
			/>
		</div>
	);
}
