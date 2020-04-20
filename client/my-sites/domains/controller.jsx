/**
 * External dependencies
 */
import page from 'page';
import { translate } from 'i18n-calypso';
import React from 'react';
import { get, includes, map, noop } from 'lodash';

/**
 * Internal Dependencies
 */
import DocumentHead from 'components/data/document-head';
import { sectionify } from 'lib/route';
import Main from 'components/main';
import getSites from 'state/selectors/get-sites';
import { getSelectedSiteId, getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import CartData from 'components/data/cart';
import DomainSearch from './domain-search';
import SiteRedirect from './domain-search/site-redirect';
import MapDomain from 'my-sites/domains/map-domain';
import TransferDomain from 'my-sites/domains/transfer-domain';
import TransferDomainStep from 'components/domains/transfer-domain-step';
import UseYourDomainStep from 'components/domains/use-your-domain-step';
import GSuiteUpgrade from 'components/upgrades/gsuite';
import {
	domainManagementTransferIn,
	domainManagementTransferInPrecheck,
	domainMapping,
	domainTransferIn,
	domainUseYourDomain,
} from 'my-sites/domains/paths';
import { isATEnabled } from 'lib/automated-transfer';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { makeLayout, render as clientRender } from 'controller';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { isGSuiteRestricted } from 'lib/gsuite';

const domainsAddHeader = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to add a domain' );
	};

	next();
};

const domainsAddRedirectHeader = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to add Site Redirect' );
	};

	next();
};

const redirectToDomainSearchSuggestion = ( context ) => {
	return page.redirect(
		`/domains/add/${ context.params.domain }?suggestion=${ context.params.suggestion }`
	);
};

const domainSearch = ( context, next ) => {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = (
		<Main wideLayout>
			<PageViewTracker path="/domains/add/:site" title="Domain Search > Domain Registration" />
			<DocumentHead title={ translate( 'Domain Search' ) } />
			<CartData>
				<DomainSearch basePath={ sectionify( context.path ) } context={ context } />
			</CartData>
		</Main>
	);
	next();
};

const siteRedirect = ( context, next ) => {
	context.primary = (
		<Main>
			<PageViewTracker
				path="/domains/add/site-redirect/:site"
				title="Domain Search > Site Redirect"
			/>
			<DocumentHead title={ translate( 'Redirect a Site' ) } />
			<CartData>
				<SiteRedirect />
			</CartData>
		</Main>
	);
	next();
};

const mapDomain = ( context, next ) => {
	context.primary = (
		<Main wideLayout>
			<PageViewTracker path={ domainMapping( ':site' ) } title="Domain Search > Domain Mapping" />
			<DocumentHead title={ translate( 'Map a Domain' ) } />
			<CartData>
				<MapDomain initialQuery={ context.query.initialQuery } />
			</CartData>
		</Main>
	);
	next();
};

const transferDomain = ( context, next ) => {
	const useStandardBack =
		context.query.useStandardBack === 'true' || context.query.useStandardBack === '1';

	context.primary = (
		<Main wideLayout>
			<PageViewTracker
				path={ domainTransferIn( ':site' ) }
				title="Domain Search > Domain Transfer"
			/>
			<DocumentHead title={ translate( 'Transfer a Domain' ) } />
			<CartData>
				<TransferDomain
					basePath={ sectionify( context.path ) }
					initialQuery={ context.query.initialQuery }
					useStandardBack={ useStandardBack }
				/>
			</CartData>
		</Main>
	);
	next();
};

const useYourDomain = ( context, next ) => {
	const handleGoBack = () => {
		let path = `/domains/add/${ context.params.site }`;
		if ( context.query.initialQuery ) {
			path += `?suggestion=${ context.query.initialQuery }`;
		}

		page( path );
	};
	context.primary = (
		<Main>
			<PageViewTracker
				path={ domainUseYourDomain( ':site' ) }
				title="Domain Search > Use Your Own Domain"
			/>
			<DocumentHead title={ translate( 'Use Your Own Domain' ) } />
			<CartData>
				<UseYourDomainStep
					basePath={ sectionify( context.path ) }
					initialQuery={ context.query.initialQuery }
					goBack={ handleGoBack }
				/>
			</CartData>
		</Main>
	);
	next();
};

const transferDomainPrecheck = ( context, next ) => {
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state ) || '';
	const domain = get( context, 'params.domain', '' );

	const handleGoBack = () => {
		page( domainManagementTransferIn( siteSlug, domain ) );
	};
	context.primary = (
		<Main>
			<PageViewTracker
				path={ domainManagementTransferInPrecheck( ':site', ':domain' ) }
				title="My Sites > Domains > Selected Domain"
			/>
			<CartData>
				<div>
					<TransferDomainStep
						forcePrecheck={ true }
						initialQuery={ domain }
						goBack={ handleGoBack }
					/>
				</div>
			</CartData>
		</Main>
	);
	next();
};

const googleAppsWithRegistration = ( context, next ) => {
	if ( ! isGSuiteRestricted() ) {
		context.primary = (
			<Main>
				<PageViewTracker
					path="/domains/add/:domain/google-apps/:site"
					title="Domain Search > Domain Registration > Google Apps"
				/>
				<DocumentHead
					title={ translate( 'Register %(domain)s', {
						args: { domain: context.params.registerDomain },
					} ) }
				/>
				<CartData>
					<GSuiteUpgrade domain={ context.params.registerDomain } />
				</CartData>
			</Main>
		);
	}

	next();
};

const redirectIfNoSite = ( redirectTo ) => {
	return ( context, next ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const sites = getSites( state );
		const siteIds = map( sites, 'ID' );

		if ( ! includes( siteIds, siteId ) ) {
			const user = getCurrentUser( state );
			const visibleSiteCount = get( user, 'visible_site_count', 0 );
			//if only one site navigate to stats to avoid redirect loop
			const redirect = visibleSiteCount > 1 ? redirectTo : '/stats';
			return page.redirect( redirect );
		}
		next();
	};
};

const redirectToUseYourDomainIfVipSite = () => {
	return ( context, next ) => {
		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( selectedSite && selectedSite.is_vip ) {
			return page.redirect(
				domainUseYourDomain( selectedSite.slug, get( context, 'params.suggestion', '' ) )
			);
		}

		next();
	};
};

const jetpackNoDomainsWarning = ( context, next ) => {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( selectedSite && selectedSite.jetpack && ! isATEnabled( selectedSite ) ) {
		context.primary = (
			<Main>
				<PageViewTracker
					path={ context.path.indexOf( '/domains/add' ) === 0 ? '/domains/add' : '/domains/manage' }
					title="My Sites > Domains > No Domains On Jetpack"
				/>
				<JetpackManageErrorPage template="noDomainsOnJetpack" siteId={ selectedSite.ID } />
			</Main>
		);

		makeLayout( context, noop );
		clientRender( context );
	} else {
		next();
	}
};

export default {
	domainsAddHeader,
	domainsAddRedirectHeader,
	domainSearch,
	jetpackNoDomainsWarning,
	siteRedirect,
	mapDomain,
	googleAppsWithRegistration,
	redirectToDomainSearchSuggestion,
	redirectIfNoSite,
	redirectToUseYourDomainIfVipSite,
	transferDomain,
	transferDomainPrecheck,
	useYourDomain,
};
