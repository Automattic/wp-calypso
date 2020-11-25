/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoCard from 'calypso/components/promo-section/promo-card';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchPlaceholder(): ReactElement {
	return (
		<Main className="jetpack-search__placeholder">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />

			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>

			<PromoCard title={ 'Placeholder' } image={ { path: JetpackSearchSVG } } isPrimary>
				<p className="jetpack-search__placeholder-description">Placeholder</p>
				<button className="jetpack-search__placeholder-button">Placeholder</button>
			</PromoCard>

			<WhatIsJetpack />
		</Main>
	);
}
