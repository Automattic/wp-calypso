import { Button, Gridicon } from '@automattic/components';
import { css, ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { SearchableSitesTable } from './searchable-sites-table';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
}

interface SitesDashboardQueryParams {
	status?: string;
	search?: string;
}

const MAX_PAGE_WIDTH = '1280px';

// Two wrappers are necessary (both pagePadding _and_ wideCentered) because we
// want there to be some padding that extends all around the page, but the header's
// background color and border needs to be able to extend into that padding.
const pagePadding = css`
	padding-left: 32px;
	padding-right: 32px;
`;

const wideCentered = css`
	max-width: ${ MAX_PAGE_WIDTH };
	margin: 0 auto;
`;

const PageHeader = styled.div`
	${ pagePadding }

	background-color: var( --studio-white );
	padding-top: 24px;
	padding-bottom: 24px;
	box-shadow: inset 0px -1px 0px rgba( 0, 0, 0, 0.05 );
`;

const PageBodyWrapper = styled.div`
	${ pagePadding }
	max-width: ${ MAX_PAGE_WIDTH };
	margin: 0 auto;
`;

const HeaderControls = styled.div`
	${ wideCentered }

	display: flex;
	flex-direction: row;
	align-items: center;
`;

const DashboardHeading = styled.h1`
	font-weight: 500;
	font-size: 20px;
	line-height: 26px;
	color: var( --studio-gray-100 );
	flex: 1;
`;

export function SitesDashboard( { queryParams }: SitesDashboardProps ) {
	const { __ } = useI18n();
	const { data: sites = [] } = useSiteExcerptsQuery();

	return (
		<main>
			<PageHeader>
				<HeaderControls>
					<DashboardHeading>{ __( 'My Sites' ) }</DashboardHeading>
					<Button primary href="/start?ref=sites-dashboard">
						<Gridicon icon="plus" />
						<span>{ __( 'New Site' ) }</span>
					</Button>
				</HeaderControls>
			</PageHeader>
			<PageBodyWrapper>
				<SearchableSitesTable
					sites={ sites }
					filterOptions={ queryParams }
					initialSearch={ queryParams.search }
				/>
			</PageBodyWrapper>
		</main>
	);
}
