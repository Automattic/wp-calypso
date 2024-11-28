import { DomainsTable, useDomainsTable } from '@automattic/domains-table';
import { Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { isSupportSession } from 'calypso/state/support/selectors';
import DomainHeader from '../components/domain-header';
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
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const { domains = [], isFetched, isLoading } = useDomainsTable( fetchAllDomains );
	const translate = useTranslate();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );
	const sitesDashboardGlobalStyles = css`
		html {
			overflow-y: auto;
		}
		body.is-section-domains {
			background: var( --studio-gray-0 );

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
				height: 40px;
				border-radius: 4px;
			}

			header.navigation-header {
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
				margin-top: 40px;
				.domains-table-toolbar {
					margin-inline: 48px;

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
						padding-top: 22px;
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

			@media only screen and ( min-width: 782px ) {
				.is-global-sidebar-visible {
					header.navigation-header {
						padding-top: 24px;
						padding-inline: 16px;
						border-block-end: 1px solid var( --color-border-secondary );
					}
					.layout__primary > main {
						background: var( --color-surface );
						border-radius: 8px;
						box-shadow: 0px 0px 17.4px 0px rgba( 0, 0, 0, 0.05 );
						overflow: hidden;
						max-width: none;
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

	const isDomainsEmpty = isFetched && domains.length === 0;
	const buttons = ! isDomainsEmpty
		? [ <OptionsDomainButton key="breadcrumb_button_1" allDomainsList /> ]
		: [];
	const purchaseActions = usePurchaseActions();

	return (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main>
				<DocumentHead title={ translate( 'Domains' ) } />
				<BodySectionCssClass
					bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page', 'is-bulk-all-domains-page' ] }
				/>
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && ! isDomainsEmpty && <GoogleDomainOwnerBanner /> }
				{ ! isDomainsEmpty ? (
					<DomainsTable
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
						sidebarMode={ props.sidebarMode }
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
