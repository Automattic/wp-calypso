import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { type ProductProps } from 'calypso/data/marketplace/use-marketplace-reviews';
import { ReviewsModal } from 'calypso/my-sites/marketplace/components/reviews-modal';

type Props = ProductProps & {
	productName: string;
};

export const ReviewsSummary = ( { slug, productName, productType }: Props ) => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	return (
		<>
			<ReviewsModal
				isVisible={ isVisible }
				onClose={ () => setIsVisible( false ) }
				slug={ slug }
				productName={ productName }
				productType={ productType }
				buttons={ [] }
			/>
			<div className="theme__sheet-reviews">
				<Button onClick={ () => setIsVisible( true ) }>{ translate( 'Add Review' ) }</Button>
			</div>
		</>
	);
};
