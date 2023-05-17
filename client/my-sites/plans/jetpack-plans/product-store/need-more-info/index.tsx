import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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
					buttonLabel={ translate( 'Explore Jetpack for Agencies' ) }
					buttonLink={ localizeUrl( 'https://jetpack.com/for/agencies/' ) }
					trackEventName="calypso_jpcom_agencies_page_more_info_button_link_click"
				/>
			</div>
		</div>
	);
};
