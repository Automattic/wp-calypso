import { useAddOnCheckoutLink } from '@automattic/add-ons';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnsGrid from './components/add-ons-grid';
import useAddOnPurchaseStatus from './hooks/use-add-on-purchase-status';
import useAddOns from './hooks/use-add-ons';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

const globalOverrides = css`
	.is-section-add-ons {
		#content.layout__content {
			background: #fdfdfd;
		}
	}
`;

/**
 * Match Layout query:
 * Mobile (Full Width)
 */
const mobileBreakpoint = 660;

const ContainerMain = styled.div`
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
	const isWide = useDesktopBreakpoint();
	const selectedSite = useSelector( getSelectedSite );

	const navigationItems = [
		{
			label: translate( 'Add-Ons' ) as string,
			href: `/add-ons/${ selectedSite?.slug }`,
			helpBubble: (
				<span>
					{ translate(
						'Expand the functionality of your WordPress.com site by enabling any of the following features.'
					) }
				</span>
			),
		},
	];

	return (
		<ContainerMain>
			<Main className="add-ons__main" wideLayout>
				<FixedNavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ navigationItems } />
				<DocumentHead title={ translate( 'Add-Ons' ) } />
				<FormattedHeader
					className="add-ons__formatted-header"
					brandFont
					headerText={ translate( 'Boost your plan with add-ons' ) }
					subHeaderText={ translate(
						'Expand the functionality of your WordPress.com site by enabling any of the following features.'
					) }
					align="left"
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

interface Props {
	context?: PageJS.Context;
}

const AddOnsMain: React.FunctionComponent< Props > = () => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const addOns = useAddOns( selectedSite?.ID );
	const checkoutLink = useAddOnCheckoutLink();

	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}

		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	const handleActionPrimary = (
		selectedSite: SiteDetails | null | undefined,
		addOnSlug: string,
		quantity?: number
	) => {
		page.redirect( `${ checkoutLink( selectedSite?.slug, addOnSlug, quantity ) }` );
	};

	const handleActionSelected = () => {
		page.redirect( `/purchases/subscriptions/${ selectedSite?.slug }` );
	};

	return (
		<div>
			<Global styles={ globalOverrides } />
			<QueryProductsList />
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<PageViewTracker path="/add-ons/:site" title="Add-Ons" />
			<ContentWithHeader>
				<AddOnsGrid
					actionPrimary={ { text: translate( 'Buy add-on' ), handler: handleActionPrimary } }
					actionSecondary={ { text: translate( 'Manage add-on' ), handler: handleActionSelected } }
					useAddOnAvailabilityStatus={ useAddOnPurchaseStatus }
					addOns={ addOns }
					highlightFeatured={ true }
				/>
			</ContentWithHeader>
		</div>
	);
};

export default AddOnsMain;
