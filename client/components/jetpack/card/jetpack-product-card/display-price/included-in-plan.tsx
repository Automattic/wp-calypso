import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const IncludedInPlan: React.FC = () => {
	const translate = useTranslate();

	return (
		<p className="jetpack-product-card__you-own-this">
			<Gridicon
				className="jetpack-product-card__you-own-this-icon"
				icon="checkmark-circle"
				size={ 48 }
			/>
			{ translate( 'Part of your current plan' ) }
		</p>
	);
};

export default IncludedInPlan;
