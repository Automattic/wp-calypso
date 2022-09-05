import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PLAN_COMPARISON_PAGE } from '../../constants';

import './style.scss';

export const SeeAllFeatures: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__see-all-features">
			<Button
				onClick={ () => recordTracksEvent( 'calypso_product_see_all_features_click' ) }
				href={ PLAN_COMPARISON_PAGE }
				target="_blank"
				rel="noreferrer"
			>
				{ translate( 'See all features' ) }
			</Button>
		</div>
	);
};
