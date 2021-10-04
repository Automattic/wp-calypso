import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const Owned: React.FC = () => {
	const translate = useTranslate();
	return (
		<p className="jetpack-product-card__you-own-this">
			<Gridicon
				className="jetpack-product-card__you-own-this-icon"
				icon="checkmark-circle"
				size={ 48 }
			/>
			{ translate( 'You own this product' ) }
		</p>
	);
};

export default Owned;
