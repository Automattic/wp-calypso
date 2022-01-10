import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackHeader from 'calypso/components/jetpack-header';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import IntroPricingBannerV2 from 'calypso/components/jetpack/intro-pricing-banner-v2';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';

import './style.scss';

export default function StoreHeader(): React.ReactElement {
	const translate = useTranslate();
	const partnerSlug = useSelector( ( state ) => getPartnerSlugFromQuery( state ) );
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );

	const isStoreLanding =
		currentRoute === '/jetpack/connect/store' ||
		currentRoute.match( new RegExp( '^/jetpack/connect/plans/[^/]+/?(monthly|annual)?$' ) );

	const headerClass = classNames( 'jetpack-connect__main-logo', {
		'add-bottom-margin': ! isStoreLanding,
	} );

	const useV2Banner = config.isEnabled( 'jetpack/pricing-page-v2-banner' );

	const renderBanner = () => {
		if ( useV2Banner ) {
			return <IntroPricingBannerV2 jetpackSaleCoupon={ jetpackSaleCoupon } />;
		}
		return jetpackSaleCoupon !== null ? null : <IntroPricingBanner />;
	};

	return (
		<>
			<DocumentHead title={ translate( 'Jetpack Connect' ) } />
			<div className={ headerClass }>
				<JetpackHeader
					partnerSlug={ partnerSlug }
					isWoo={ false }
					isWooDna={ false }
					darkColorScheme
				/>
			</div>
			{ isStoreLanding && (
				<FormattedHeader
					headerText={ translate( 'Explore our Jetpack plans' ) }
					subHeaderText={ translate( 'Pick a plan that fits your needs.' ) }
					brandFont
				/>
			) }
			{ renderBanner() }
		</>
	);
}
