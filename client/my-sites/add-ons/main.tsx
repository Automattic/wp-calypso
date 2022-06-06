import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnsGrid from './components/add-ons-grid';
import useAddOns from './hooks/use-add-ons';
import type { ReactElement } from 'react';

const globalOverrides = css`
	.is-section-add-ons {
		#content.layout__content {
			background: #fdfdfd;
		}
	}
`;

const HeaderSpacer = styled.div`
	height: 58px;

	@include breakpoint-deprecated( '<960px' ) {
		height: 66px;
	}

	@include breakpoint-deprecated( '<660px' ) {
		height: 76px;
	}
`;

const Content = styled.div`
	margin-top: 30px;
`;

const ContentWithHeader = ( props: { children: ReactElement } ): ReactElement => {
	const translate = useTranslate();
	const isWide = useDesktopBreakpoint();
	const selectedSite = useSelector( getSelectedSite );

	const navigationItems = [
		{
			label: translate( 'Add-Ons' ) as string,
			href: `/add-ons/${ selectedSite?.slug }`,
			helpBubble: (
				<span>
					{ translate( 'Your home base for accessing, setting up, and managing your add-ons.' ) }
				</span>
			),
		},
	];

	return (
		<Main wideLayout>
			<FixedNavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ navigationItems } />
			<DocumentHead title={ translate( 'Add-Ons' ) } />
			<HeaderSpacer />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Boost your plan with add-ons' ) }
				subHeaderText={ translate(
					'Your home base for accessing, setting up, and managing your add-ons.'
				) }
				align="left"
			/>
			<Content>{ props.children }</Content>
		</Main>
	);
};

const NoAccess = () => {
	const translate = useTranslate();

	return (
		<ContentWithHeader>
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration={ '/calypso/images/illustrations/illustration-404.svg' }
			/>
		</ContentWithHeader>
	);
};

interface Props {
	context?: PageJS.Context;
}

const AddOnsMain: React.FunctionComponent< Props > = () => {
	const addOns = useAddOns();
	const selectedSite = useSelector( getSelectedSite );
	const sitePurchases = useSelector( ( state ) => {
		return getSitePurchases( state, selectedSite?.ID );
	} );
	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}

		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	const handleActionPrimary = ( slug: string ) => {
		if ( 'no-adverts/no-adverts.php' === slug ) {
			page.redirect( `/checkout/${ selectedSite?.slug }/no-ads` );
			return;
		}
		page.redirect( `/checkout/${ selectedSite?.slug }/${ slug }` );
	};

	const handleActionSelected = () => {
		page.redirect( `/purchases/subscriptions/${ selectedSite?.slug }` );
	};

	const isAddOnSelected = ( slug: string ) => {
		return sitePurchases.filter( ( product ) => product.productSlug === slug ).length > 0;
	};

	return (
		<div>
			<Global styles={ globalOverrides } />
			<QueryProductsList persist />
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<PageViewTracker path="/add-ons/:site" title="Add-Ons" />
			<ContentWithHeader>
				<AddOnsGrid
					actionPrimary={ { text: 'Buy add-on', handler: handleActionPrimary } }
					actionSelected={ { text: 'Manage add-on', handler: handleActionSelected } }
					isAddOnSelected={ isAddOnSelected }
					addOns={ addOns }
					highlight={ false }
				/>
			</ContentWithHeader>
		</div>
	);
};

export default AddOnsMain;
