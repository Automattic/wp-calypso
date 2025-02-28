import page from '@automattic/calypso-router';
import { AddOns } from '@automattic/data-stores';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnsGrid from './components/add-ons-grid';
import type { ReactElement } from 'react';

const globalOverrides = css`
	.is-section-add-ons {
		height: 100%;
		#content.layout__content {
			background: #fdfdfd;
			height: 100%;
		}
	}
	.layout__primary {
		height: 100%;
	}
`;

/**
 * Match Layout query:
 * Mobile (Full Width)
 */
const mobileBreakpoint = 660;

const ContainerMain = styled.div`
	height: 100%;
	.add-ons__main {
		.add-ons__formatted-header {
			text-align: center;
			margin-top: 100px;
			margin-bottom: 40px;

			@media screen and ( min-width: ${ mobileBreakpoint }px ) {
				margin-top: 80px;
				margin-bottom: 60px;
			}

			.formatted-header__title {
				font-size: 2rem;
			}
		}

		.add-ons__main-content {
			padding: 1em;
			@media screen and ( min-width: ${ mobileBreakpoint }px ) {
				padding: 0;
			}
		}
	}
`;

const ContentWithHeader = ( props: { children: ReactElement } ) => {
	const translate = useTranslate();

	return (
		<ContainerMain>
			<Main className="add-ons__main" wideLayout>
				<DocumentHead title={ translate( 'Add-Ons' ) } />
				<NavigationHeader
					title={ translate( 'Boost your plan with add-ons' ) }
					subtitle={ translate(
						'Expand the functionality of your WordPress.com site by enabling any of the following features.'
					) }
				/>
				<div className="add-ons__main-content">{ props.children }</div>
			</Main>
		</ContainerMain>
	);
};

const NoAccess = () => {
	const translate = useTranslate();

	return (
		<ContentWithHeader>
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration="/calypso/images/illustrations/illustration-404.svg"
			/>
		</ContentWithHeader>
	);
};

const AddOnsMain = () => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite ) ?? null;
	const addOns = AddOns.useAddOns( { selectedSiteId: selectedSite?.ID } );

	const checkoutLink = AddOns.useAddOnCheckoutLink();

	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}

		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	const handleActionPrimary = ( addOnSlug: string, quantity?: number ) => {
		recordTracksEvent( 'calypso_add_ons_action_primary_click', {
			add_on_slug_with_quantity: `${ addOnSlug }${ quantity ? `:${ quantity }` : '' }`,
			add_on_slug: addOnSlug,
			quantity,
		} );

		page.redirect( `${ checkoutLink( selectedSite?.ID ?? null, addOnSlug, quantity ) }` );
	};

	const handleActionSelected = () => {
		page.redirect( `/purchases/subscriptions/${ selectedSite?.slug }` );
	};

	return (
		<>
			<Global styles={ globalOverrides } />
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<PageViewTracker path="/add-ons/:site" title="Add-Ons" />
			<ContentWithHeader>
				<AddOnsGrid
					actionPrimary={ { text: translate( 'Buy add-on' ), handler: handleActionPrimary } }
					actionSecondary={ { text: translate( 'Manage add-on' ), handler: handleActionSelected } }
					addOns={ addOns }
					siteId={ selectedSite?.ID }
					highlightFeatured
				/>
			</ContentWithHeader>
		</>
	);
};

export default AddOnsMain;
