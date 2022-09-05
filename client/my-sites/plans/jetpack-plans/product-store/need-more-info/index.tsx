import { useTranslate } from 'i18n-calypso';
import {
	PLAN_COMPARISON_PAGE,
	AGENCIES_PAGE,
} from 'calypso/my-sites/plans/jetpack-plans/constants';
import MoreInfoBox from '../../more-info-box';

import './style.scss';

export const NeedMoreInfo: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__need-more-info">
			<h3 className="jetpack-product-store__need-more-info-headline">
				{ translate( 'Need more info?' ) }
			</h3>
			<div className="jetpack-product-store__need-more-info-buttons">
				<MoreInfoBox
					buttonLabel={ translate( 'Compare all product bundles' ) }
					buttonLink={ PLAN_COMPARISON_PAGE }
					trackEventName="calypso_plans_comparison_table_link_click"
				/>
				<MoreInfoBox
					buttonLabel={ translate( 'Explore Jetpack for Agencies' ) }
					buttonLink={ AGENCIES_PAGE }
					trackEventName="calypso_jpcom_agencies_page_more_info_button_link_click"
				/>
			</div>
		</div>
	);
};
