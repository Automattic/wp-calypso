/**
 * External dependencies
 */
import React, { useMemo } from 'react';
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
import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';

// Fresh Start 2021 promotion; runs from Feb 1 00:00 to Feb 14 23:59 UTC automatically.
// Safe to remove on or after Feb 15.
import FreshStart2021SaleBanner from 'calypso/components/jetpack/fresh-start-2021-sale-banner';

// Part of the NPIP test iteration
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';

import './style.scss';

export default function StoreHeader( { urlQueryArgs = {} } = {} ): React.ReactElement {
	const translate = useTranslate();
	const partnerSlug = useSelector( ( state ) => getPartnerSlugFromQuery( state ) );
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const isStoreLanding =
		currentRoute === '/jetpack/connect/store' ||
		currentRoute.match( new RegExp( '^/jetpack/connect/plans/[^/]+/?(monthly|annual)?$' ) );

	const headerClass = classNames( 'jetpack-connect__main-logo', {
		'add-bottom-margin': ! isStoreLanding,
	} );

	// Don't show for the NPIP variant
	const showFreshStartBanner = useMemo(
		() => getForCurrentCROIteration( ( variation: Iterations ) => variation !== Iterations.NPIP ),
		[]
	);

	// *Only* show for the NPIP variant
	const showIntroPricingBanner = useMemo(
		() => getForCurrentCROIteration( ( variation: Iterations ) => variation === Iterations.NPIP ),
		[]
	);

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

			{ showFreshStartBanner && <FreshStart2021SaleBanner urlQueryArgs={ urlQueryArgs } /> }
			{ showIntroPricingBanner && <IntroPricingBanner /> }
		</>
	);
}
