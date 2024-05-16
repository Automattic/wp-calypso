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
import GoogleDomainOwnerBanner from './google-domain-owner-banner';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';

import './style.scss';

interface BulkAllDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const { domains, isLoading } = useDomainsTable( fetchAllDomains );
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
				padding: 16px 16px 16px calc( var( --sidebar-width-max ) );

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
					font-family: 'SF Pro Display', sans-serif;
					font-size: 1.5rem;
					font-style: normal;
					font-weight: 500;
					line-height: 1.2;
				}
				.domain-header__buttons .button {
					line-height: 22px;
					border-radius: 2px;
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
				margin-top: 35px;
				.domains-table-toolbar {
					margin-inline: 64px;
				}
				table {
					overflow-y: auto;
					max-height: calc( 100vh - 235px );
					padding-inline: 64px;
					margin-bottom: 0;
				}
				.domains-table-header {
					position: sticky;
					top: 0;
					z-index: 2;
				}
			}

			.search-component.domains-table-filter__search.is-open.has-open-icon {
				border-radius: 2px;
				height: 36px;
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
					height: 36px;

					&::placeholder {
						color: var( --studio-gray-40 );
					}
				}
				max-width: 245px;
				transition: none;
			}

			@media only screen and ( min-width: 782px ) {
				.is-global-sidebar-visible {
					header.navigation-header {
						padding-top: 24px;
						padding-inline: 64px;
						border-block-end: 1px solid var( --studio-gray-0 );
					}
					.layout__primary > main {
						background: var( --color-surface );
						border-radius: 8px;
						box-shadow: none;
						height: calc( 100vh - 32px );
						overflow: hidden;
						max-width: none;
					}
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
					padding: 0 8px;
				}
				.domains-table-toolbar {
					margin-inline: 0 !important;
				}
				table {
					padding-inline: 0 !important;
				}
				div.layout.is-global-sidebar-visible {
					.layout__primary > main {
						height: calc( 100vh - var( --masterbar-height ) );
					}
				}
			}

			@media only screen and ( max-width: 781px ) {
				div.layout.is-global-sidebar-visible {
					.layout__primary {
						overflow-x: auto;
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
						margin-inline: 16px;
					}
					table {
						padding-inline: 16px;
					}
				}
				div.layout.is-global-sidebar-visible {
					.layout__primary > main {
						height: calc( 100vh - var( --masterbar-height ) - 48px );
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

	const buttons = [
		<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions allDomainsList />,
	];

	const purchaseActions = usePurchaseActions();

	return (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main>
				<DocumentHead title={ translate( 'Domains' ) } />
				<BodySectionCssClass bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && <GoogleDomainOwnerBanner /> }
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
				/>
			</Main>
		</>
	);
}
