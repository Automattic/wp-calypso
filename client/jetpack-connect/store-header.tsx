/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackHeader from 'calypso/components/jetpack-header';
import DocumentHead from 'calypso/components/data/document-head';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import useMaybeSocialProofHeader from 'calypso/my-sites/plans/jetpack-plans/use-maybe-social-proof-header';

import './style.scss';

export default function StoreHeader(): React.ReactElement {
	const translate = useTranslate();
	const partnerSlug = useSelector( ( state ) => getPartnerSlugFromQuery( state ) );
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const isStoreLanding =
		currentRoute === '/jetpack/connect/store' ||
		currentRoute.match( new RegExp( '^/jetpack/connect/plans/[^/]+/?(monthly|annual)?$' ) );

	const headerClass = classNames( 'jetpack-connect__main-logo', {
		'add-bottom-margin': ! isStoreLanding,
	} );

	const headerText = useMaybeSocialProofHeader() ?? translate( 'Explore our Jetpack plans' );

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
					headerText={ headerText }
					subHeaderText={ translate( 'Pick a plan that fits your needs.' ) }
					brandFont
				/>
			) }

			<IntroPricingBanner />
		</>
	);
}
