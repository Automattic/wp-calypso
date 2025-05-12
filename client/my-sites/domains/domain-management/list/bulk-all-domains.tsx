import config from '@automattic/calypso-config';
import { PartialDomainData } from '@automattic/data-stores';
import {
	DomainStatusPurchaseActions,
	DomainsTable,
	useDomainsTable,
} from '@automattic/domains-table';
import { Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { canAnySiteConnectDomains } from 'calypso/state/selectors/can-any-site-connect-domains';
import { isSupportSession } from 'calypso/state/support/selectors';
import DomainHeader, { NavigationItem } from '../components/domain-header';
import DotcomDomainsDataViews from '../dataviews';
import { type QueryParams } from '../dataviews/query-params';
import {
	createBulkAction,
	deleteBulkActionStatus,
	fetchAllDomains,
	fetchBulkActionStatus,
	fetchSite,
	fetchSiteDomains,
} from '../domains-table-fetch-functions';
import EmptyState from './empty-state';
import GoogleDomainOwnerBanner from './google-domain-owner-banner';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';
import './style.scss';

interface BulkAllDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
	sidebarMode?: boolean;
	selectedDomainName?: string;
	selectedFeature?: string;
	queryParams: QueryParams;
}

const domainsDataViewsGlobalStyles = css`
	body.is-bulk-all-domains-page {
		background: var( --color-main-background );

		header.navigation-header {
			border-block-end: 1px solid var( --color-neutral-5 );
			padding-block-start: 24px;
			padding-block-end: 24px;
		}

		div.layout.is-global-sidebar-visible {
			.layout__content {
				padding-top: calc( var( --masterbar-height ) + var( --content-padding-top ) );
				padding-bottom: var( --content-padding-bottom );
			}
			.layout__primary > main {
				height: calc(
					100vh - var( --masterbar-height ) - var( --content-padding-top ) - var(
							--content-padding-bottom
						)
				);
			}
		}

		@media only screen and ( min-width: 782px ) {
			.is-global-sidebar-visible {
				header.navigation-header {
					padding-inline: 16px;
				}
			}
		}
	}
`;

const domainsDashboardGlobalStyles = css`
	html {
		overflow-y: auto;
	}
	body.is-bulk-all-domains-page {
		background: var( --color-main-background );

		&.rtl .layout__content {
			padding: 16px calc( var( --sidebar-width-max ) ) 16px 16px;
		}

		.layout__content {
			// Add border around everything
			overflow: hidden;
			min-height: 100vh;
			padding-top: calc( var( --masterbar-height ) + 16px );
			padding-right: 16px;
			padding-bottom: 16px;
			padding-left: calc( var( --sidebar-width-max ) );

			.layout_primary > main {
				padding-bottom: 0;
			}
		}

		.layout__secondary .global-sidebar {
			border: none;
		}

		.has-no-masterbar .layout__content {
			padding-top: 16px !important;
		}

		.select-dropdown,
		.select-dropdown__header {
			height: var( --domains-table-toolbar-height, 40px );
			border-radius: 4px;
		}

		.domains-overview__list .navigation-header {
			padding-top: 24px;

			.formatted-header {
				max-height: 41px;
			}

			.navigation-header__main {
				align-items: center;
			}

			.formatted-header__title {
				color: var( --studio-gray-80, #2c3338 );
				font-size: 1.5rem;
				font-style: normal;
				font-weight: 500;
				line-height: 1.2;
			}
			.domain-header__buttons .button {
				line-height: 22px;
				white-space: nowrap;
				margin-left: 0;
			}
			.domain-header__buttons-mobile {
				white-space: nowrap;
			}
			@media only screen and ( max-width: 479px ) {
				.domain-header__buttons-mobile {
					.options-domain-button__add {
						height: 24px;
						width: 24px;
						transition: transform 0.2s cubic-bezier( 0.175, 0.885, 0.32, 1.275 );
					}

					.is-menu-visible .options-domain-button__add {
						transform: rotate( 180deg );
					}

					.options-domain-button {
						width: 48px;
					}
				}
			}
		}

		.domains-table {
			.domains-table-toolbar {
				margin-inline: 48px;
				padding: 16px 0;

				.domains-table-bulk-actions-toolbar {
					align-items: flex-start;

					.button {
						padding: 4px 12px 4px 8px;

						&:disabled img {
							opacity: 0.5;
						}
					}

					.select-dropdown {
						border-radius: 2px;

						.select-dropdown__header {
							border-radius: 2px;
							height: 32px;
							padding: 0 8px;
						}
					}
				}
			}
			table {
				overflow-y: auto;
				max-height: calc( 100vh - 235px );
				margin-bottom: 0;
				padding-inline: 0;
				margin-inline-start: 0;
				margin-top: 0;

				grid-template-columns: 75px 1fr minmax( auto, 1fr ) auto auto auto auto;

				th:last-child,
				td:last-child {
					padding-right: 16px;
				}

				th:first-child,
				td:first-child {
					padding-left: 56px;
				}

				thead.domains-table-header {
					position: sticky;
					top: 0;
					z-index: 2;
				}

				th {
					padding-top: 14px;
					padding-bottom: 14px;

					.list__header-column {
						color: #1e1e1e;

						&:hover {
							color: var( --color-accent );
						}
					}
				}
			}
		}

		.search-component.domains-table-filter__search.is-open.has-open-icon {
			border-radius: 4px;
			height: 40px;
			flex-direction: row-reverse;
			padding-inline: 10px 8px;
			font-size: 14px;
			color: var( --studio-gray-40 );
			svg {
				fill: var( --studio-gray-40 );
				color: var( --studio-gray-40 );
			}

			input.search-component__input[type='search'] {
				font-size: 14px;
				height: 40px;

				&::placeholder {
					color: var( --studio-gray-40 );
				}
			}
			max-width: 245px;
			transition: none;
		}

		.search-component.domains-table-filter__search.is-open.has-focus {
			border-color: var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
			box-shadow: 0 0 0 0.5px
				var( --wp-components-color-accent, var( --wp-admin-theme-color, #3858e9 ) );
		}

		div.layout.is-global-sidebar-visible {
			.layout__content {
				padding-top: calc( var( --masterbar-height ) + var( --content-padding-top ) );
				padding-bottom: var( --content-padding-bottom );
			}
			.layout__primary > main {
				height: calc(
					100vh - var( --masterbar-height ) - var( --content-padding-top ) - var(
							--content-padding-bottom
						)
				);
			}
		}

		.domains-overview__list.multi-sites-dashboard-layout-column,
		.domains-overview__list.main .hosting-dashboard-layout-column__container,
		.domains-overview__list.main .hosting-dashboard-layout-column__container > .main,
		.domains-overview__list .multi-sites-dashboard-layout-column__container,
		.domains-overview__details .multi-sites-dashboard-layout-column__container,
		.multi-sites-dashboard-layout-column.domains-overview__list.main
			.multi-sites-dashboard-layout-column__container
			.main {
			height: 100%;
		}

		.multi-sites-dashboard-layout-column.domains-overview__list.main
			.multi-sites-dashboard-layout-column__container
			.main,
		.domains-overview__list.main .hosting-dashboard-layout-column__container > .main {
			display: flex;
			flex-direction: column;
			padding-bottom: 0;

			.domains-table {
				flex-grow: 1;
				margin-top: 0;
				overflow: auto;
				padding-bottom: 0;
				width: 100%;

				table {
					max-height: unset;
				}
			}
		}

		.domains-overview__list {
			.domains-table__row {
				.gridicons-ellipsis {
					rotate: 90deg;
					visibility: hidden;
				}

				&:hover,
				&.is-selected {
					.gridicons-ellipsis {
						visibility: visible;
					}
				}
			}
		}

		@media only screen and ( min-width: 782px ) {
			.is-global-sidebar-visible {
				header.navigation-header {
					padding-top: 24px;
					padding-inline: 16px;
					border-block-end: 1px solid var( --color-neutral-5 );
				}
			}
		}

		@media only screen and ( min-width: 960px ) {
			.domains-table {
				.domains-table-toolbar {
					margin-inline: 48px;
				}
				table {
					grid-template-columns: 75px 2fr 1fr 1fr 1fr auto auto auto auto;

					th:last-child,
					td:last-child {
						padding-right: 56px;
					}

					th:first-child,
					td:first-child {
						padding-left: 56px;
					}
				}
			}
			.domains-overview__list .domains-table {
				table {
					grid-template-columns: 4fr auto;
					max-height: 100%;

					.domains-table__domain-name {
						overflow-wrap: anywhere;
					}
				}
			}
			.is-global-sidebar-visible header.navigation-header {
				padding-inline: 26px;
			}
		}

		@media only screen and ( max-width: 600px ) {
			.navigation-header__main {
				justify-content: space-between;
				.formatted-header {
					flex: none;
				}
			}
			.domains-table {
				table {
					grid-template-columns: 75px 1fr minmax( auto, 1fr ) auto auto auto auto;

					th:last-child,
					td:last-child {
						padding-right: 16px;
					}

					th:first-child,
					td:first-child {
						padding: 0 0 0 40px;
						padding-left: 40px;
					}
				}
			}
			.domains-table-toolbar {
				margin-inline: 32px;
			}
		}

		@media only screen and ( max-width: 781px ) {
			div.layout.is-global-sidebar-visible {
				.layout__primary {
					overflow-x: unset;
				}
			}
			.layout__primary > main {
				background: var( --color-surface );
				margin: 0;
				border-radius: 8px;
			}
			header.navigation-header {
				padding-inline: 16px;
				padding-bottom: 0;
				padding-top: 24px;
			}
		}
		@media only screen and ( min-width: 601px ) and ( max-width: 781px ) {
			.domains-table {
				.domains-table-toolbar {
					margin-inline: 48px;
				}
				table {
					grid-template-columns: 75px 1fr minmax( auto, 1fr ) auto auto auto auto;

					th:last-child,
					td:last-child {
						padding-right: 16px;
					}

					th:first-child,
					td:first-child {
						padding-left: 56px;
					}
				}
			}
		}
	}
`;

type RendererProps = {
	isInSupportSession: boolean;
	purchaseActions: DomainStatusPurchaseActions;
	sidebarMode?: boolean;
	selectedDomainName?: string;
	item: NavigationItem;
	selectedFeature?: string;
	hasConnectableSites?: boolean;
	domains: PartialDomainData[];
	isLoading?: boolean;
	queryParams: QueryParams;
};

function DomainsTableRenderer( {
	isInSupportSession,
	purchaseActions,
	sidebarMode,
	selectedDomainName,
	selectedFeature,
	hasConnectableSites,
	domains,
	isLoading,
}: RendererProps ) {
	return (
		<DomainsTable
			context="domains"
			isLoadingDomains={ isLoading }
			domains={ domains }
			isAllSitesView
			domainStatusPurchaseActions={ purchaseActions }
			currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
			fetchAllDomains={ fetchAllDomains }
			fetchSite={ fetchSite }
			fetchSiteDomains={ fetchSiteDomains }
			createBulkAction={ createBulkAction }
			fetchBulkActionStatus={ fetchBulkActionStatus }
			deleteBulkActionStatus={ deleteBulkActionStatus }
			sidebarMode={ sidebarMode }
			selectedFeature={ selectedFeature }
			selectedDomainName={ selectedDomainName }
			hasConnectableSites={ hasConnectableSites }
		/>
	);
}

function DomainsDataViewsRenderer( {
	isInSupportSession,
	purchaseActions,
	sidebarMode,
	selectedDomainName,
	selectedFeature,
	domains,
	isLoading,
	hasConnectableSites,
	queryParams,
}: RendererProps ) {
	return (
		<DotcomDomainsDataViews
			domains={ domains ?? [] }
			isLoading={ !! isLoading }
			selectedItem={ undefined }
			isAllSitesView
			domainStatusPurchaseActions={ purchaseActions }
			currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
			fetchSiteDomains={ fetchSiteDomains }
			createBulkAction={ createBulkAction }
			fetchBulkActionStatus={ fetchBulkActionStatus }
			selectedDomainName={ selectedDomainName }
			sidebarMode={ sidebarMode }
			selectedFeature={ selectedFeature }
			hasConnectableSites={ hasConnectableSites }
			context="domains"
			queryParams={ queryParams }
		/>
	);
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const isDomainsDataViewsEnabled = config.isEnabled( 'calypso/domains-dataviews' );

	const translate = useTranslate();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );
	const hasConnectableSites = useSelector( canAnySiteConnectDomains );
	const item = {
		label: translate( 'Domains' ),
		helpBubble: translate(
			'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
				},
			}
		),
	};

	const purchaseActions = usePurchaseActions();
	const { domains = [], isFetched, isLoading } = useDomainsTable( fetchAllDomains );

	const isDomainsEmpty = isFetched && domains.length === 0;
	const buttons = ! isDomainsEmpty
		? [
				<OptionsDomainButton
					key="breadcrumb_button_1"
					allDomainsList
					sidebarMode={ props.sidebarMode }
				/>,
		  ]
		: [];

	const Element = isDomainsDataViewsEnabled ? DomainsDataViewsRenderer : DomainsTableRenderer;

	return (
		<>
			<Global
				styles={
					isDomainsDataViewsEnabled ? domainsDataViewsGlobalStyles : domainsDashboardGlobalStyles
				}
			/>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main className={ isDomainsDataViewsEnabled ? 'dataviews' : '' }>
				<DocumentHead title={ translate( 'Domains' ) } />
				<BodySectionCssClass
					bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page', 'is-bulk-all-domains-page' ] }
				/>
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && ! isDomainsEmpty && <GoogleDomainOwnerBanner /> }
				{ ! isDomainsEmpty ? (
					<Element
						isInSupportSession={ isInSupportSession }
						hasConnectableSites={ hasConnectableSites }
						purchaseActions={ purchaseActions }
						sidebarMode={ props.sidebarMode }
						selectedDomainName={ props.selectedDomainName }
						selectedFeature={ props.selectedFeature }
						item={ item }
						domains={ domains }
						isLoading={ isLoading }
						queryParams={ props.queryParams }
					/>
				) : (
					<div className="bulk-domains-empty-state">
						<div className="bulk-domains-empty-state__main">
							<EmptyState />
						</div>
					</div>
				) }
			</Main>
		</>
	);
}
