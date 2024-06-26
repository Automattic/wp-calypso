import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { JETPACK_COM_A4A_LANDING_PAGE } from 'calypso/jetpack-cloud/sections/manage/pricing/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import MoreInfoBox from '../../more-info-box';

import './style.scss';

const usePlanComparisonUrl = () => {
	const locale = useLocale();

	return useMemo( () => {
		const rootPath = isJetpackCloud() ? '' : 'https://cloud.jetpack.com';

		// Locale is guaranteed to be 'en' if no locale is defined;
		// see @automattic/i18n-utils/src/locale-context.tsx:35
		if ( locale === 'en' ) {
			return `${ rootPath }/features/comparison`;
		}

		return `${ rootPath }/${ locale }/features/comparison`;
	}, [ locale ] );
};

export const NeedMoreInfo: React.FC = () => {
	const translate = useTranslate();

	const planComparisonUrl = usePlanComparisonUrl();

	return (
		<div className="jetpack-product-store__need-more-info">
			<h2 className="jetpack-product-store__need-more-info-headline">
				{ translate( 'Need more info?' ) }
			</h2>
			<div className="jetpack-product-store__need-more-info-buttons">
				<MoreInfoBox
					buttonLabel={ translate( 'Compare all product bundles' ) }
					buttonLink={ planComparisonUrl }
					trackEventName="calypso_plans_comparison_table_link_click"
				/>
				<MoreInfoBox
					buttonLabel={ translate( 'Jetpack for Agencies' ) }
					// The JETPACK_COM_A4A_LANDING_PAGE is only available in English at this time, so we
					// won't worry about localizing the link for now. Although we may want to localize it
					// in the future when/if the page gets translated & posted to other languages/locales.
					buttonLink={ JETPACK_COM_A4A_LANDING_PAGE }
					trackEventName="calypso_jpcom_agencies_page_more_info_button_link_click"
				/>
			</div>
		</div>
	);
};
