import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PLAN_COMPARISON_PAGE } from '../../constants';

import './style.scss';

export const SeeAllFeatures: React.FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onButtonClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_product_store_see_all_features_click' ) );
	}, [ dispatch ] );

	return (
		<div className="jetpack-product-store__see-all-features">
			<Button
				onClick={ onButtonClick }
				href={ PLAN_COMPARISON_PAGE }
				target="_blank"
				rel="noreferrer"
			>
				{ translate( 'See all features' ) }
			</Button>
		</div>
	);
};
