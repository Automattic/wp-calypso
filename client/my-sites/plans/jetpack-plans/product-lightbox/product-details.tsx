import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import { SelectorProduct } from '../types';
import DescriptionList from './description-list';

type ProductDetailsProps = {
	product: SelectorProduct;
};

const ProductDetails: React.FC< ProductDetailsProps > = ( { product } ) => {
	const isMobile = useMobileBreakpoint();
	const [ expandedDetailType, setExpandedDetailType ] = useState( '' );
	const productDetails = [
		{ type: 'includes', title: 'Includes', items: product.whatIsIncluded },
		{ type: 'benefits', title: 'Benefits', items: product.benefits },
	];

	return (
		<>
			{ productDetails.map( ( { type, title, items }, index, infoList ) => (
				<div className="product-lightbox__detail-list" key={ type }>
					{ isMobile ? (
						<FoldableCard
							hideSummary
							header={ title }
							clickableHeader={ true }
							expanded={ expandedDetailType === type }
							onOpen={ () => setExpandedDetailType( type ) }
						>
							<DescriptionList items={ items } />
						</FoldableCard>
					) : (
						<>
							<p>{ title }</p>
							<DescriptionList items={ items } />
						</>
					) }
					{ index !== infoList.length - 1 && <hr /> }
				</div>
			) ) }
		</>
	);
};

export default ProductDetails;
