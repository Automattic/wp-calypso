import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, JetpackLogo } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { download, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useSitesDashboardImportSiteUrl } from 'calypso/sites-dashboard/hooks/use-sites-dashboard-import-site-url';
import { MEDIA_QUERIES, TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

const MAX_PAGE_WIDTH = '1224px';
const pagePadding = {
	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		paddingInlineStart: '16px',
		paddingInlineEnd: '16px',
	},
};

const PageHeader = styled.div( {
	...pagePadding,

	backgroundColor: 'var( --studio-white )',

	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		padding: '16px',
	},
} );

const HeaderControls = styled.div( {
	maxWidth: MAX_PAGE_WIDTH,
	marginBlock: 0,
	marginInline: 'auto',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-start',
	fontWeight: 500,
} );

export const PageBodyBottomContainer = styled.div( {
	color: 'var( --color-text-subtle )',
	paddingBlockStart: '16px',
	paddingBlockEnd: '24px',
	gap: '24px',
	display: 'flex',
	flexDirection: 'column',
	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		paddingBlockEnd: '48px',
	},
} );

const responsiveButtonStyles = {
	alignItems: 'center',
	fontSize: '12px',
	display: 'inline-flex',
	height: '28px',
	lineHeight: '14px',
	padding: '0 12px',
};

const ManageAllDomainsButton = styled( Button )`
	border-color: var( --color-neutral-5 );
	border-radius: 4px;
	margin-inline-end: 1rem;
	white-space: nowrap;

	.sites-dashboard__layout:not(.preview-hidden) & {
		${ responsiveButtonStyles }
		margin-inline-end: 0.5rem;
	},
`;

const AddNewSiteSplitButton = styled( SplitButton )< { isMobile: boolean } >`
	.split-button__main {
		border-radius: 4px 0 0 4px;
		-webkit-font-smoothing: antialiased;
	}

	.split-button__toggle {
		border-radius: ${ ( { isMobile } ) => ( isMobile ? '4px' : '0 4px 4px 0' ) };
	}

	.sites-dashboard__layout:not( .preview-hidden ) & {
		.split-button__main,
		.split-button__toggle {
			${ responsiveButtonStyles }
		}

		.split-button__toggle .gridicon {
			top: 2px;
		}
	}
`;

const DownloadIcon = styled( Icon )`
	margin-right: 8px;
	vertical-align: bottom;
`;

const popoverHoverStyles = css`
	&:hover,
	&:focus {
		fill: var( --color-text-inverted );
	}
`;

const SitesDashboardHeader = () => {
	const { __ } = useI18n();
	const isMobile = useMobileBreakpoint();

	const createSiteUrl = useAddNewSiteUrl( {
		source: TRACK_SOURCE_NAME,
		ref: 'topbar',
	} );

	const importSiteUrl = useSitesDashboardImportSiteUrl( {
		ref: 'topbar',
	} );

	return (
		<PageHeader>
			<HeaderControls>
				<ManageAllDomainsButton className="sites-manage-all-domains-button" href="/domains/manage">
					{ __( 'Manage all domains' ) }
				</ManageAllDomainsButton>
				<AddNewSiteSplitButton
					className="sites-add-new-site-split-button"
					primary
					whiteSeparator
					label={ isMobile ? undefined : __( 'Add new site' ) }
					onClick={ () => {
						recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_add' );
					} }
					href={ createSiteUrl }
					toggleIcon={ isMobile ? 'plus' : undefined }
					isMobile={ isMobile }
				>
					<PopoverMenuItem
						onClick={ () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_jetpack' );
						} }
						href={ addQueryArgs( '/jetpack/connect', {
							cta_from: TRACK_SOURCE_NAME,
							cta_id: 'add-site',
						} ) }
					>
						<JetpackLogo className="gridicon" size={ 18 } />
						<span>{ __( 'Add Jetpack to a self-hosted site' ) }</span>
					</PopoverMenuItem>
					<PopoverMenuItem
						className={ `${ popoverHoverStyles }` }
						onClick={ () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_import' );
						} }
						href={ importSiteUrl }
					>
						<DownloadIcon icon={ download } size={ 18 } />
						<span>{ __( 'Import an existing site' ) }</span>
					</PopoverMenuItem>
				</AddNewSiteSplitButton>
			</HeaderControls>
		</PageHeader>
	);
};

export default SitesDashboardHeader;
