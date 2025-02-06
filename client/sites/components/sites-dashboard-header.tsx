import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { JetpackLogo } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { download, Icon } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { SitesAddNewSitePopover } from 'calypso/components/sites-add-new-site';
import SplitButton from 'calypso/components/split-button';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { MEDIA_QUERIES, TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';
import { useSitesDashboardImportSiteUrl } from '../hooks/use-sites-dashboard-import-site-url';
import { LinkWithRedirect } from './link-with-redirect';
import './sites-dashboard-header.scss';

interface SitesDashboardHeaderProps {
	isPreviewPaneOpen: boolean;
}

const PageHeader = styled.div( {
	backgroundColor: 'var( --studio-white )',
} );

const HeaderControls = styled.div( {
	marginBlock: 0,
	marginInline: 'auto',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-start',
	fontWeight: 500,
	justifyContent: 'flex-end',
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

const AddNewSiteSplitButton = styled( SplitButton )< { isMobile: boolean } >`
	.split-button__main {
		border-radius: 2px 0 0 2px;
		-webkit-font-smoothing: antialiased;

		.rtl & {
			border-radius: 0 2px 2px 0;
		}
	}

	.split-button__toggle {
		border-radius: ${ ( { isMobile } ) => ( isMobile ? '2px' : '0 2px 2px 0' ) };

		.rtl & {
			border-radius: ${ ( { isMobile } ) => ( isMobile ? '2px' : '2px 0 0 2px' ) };
		}
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

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const popoverHoverStyles = css`
	&:hover,
	&:focus {
		fill: var( --color-text-inverted );
	}
`;

const SitesDashboardHeader: React.FC< SitesDashboardHeaderProps > = ( { isPreviewPaneOpen } ) => {
	const translate = useTranslate();
	const isDriveMigrationEnabled = config.isEnabled( 'sites/drive-migrations' );
	const isMobile = useMobileBreakpoint();
	const createSiteUrl = useAddNewSiteUrl( {
		source: TRACK_SOURCE_NAME,
		ref: 'topbar',
	} );
	const importSiteUrl = useSitesDashboardImportSiteUrl( {
		ref: 'topbar',
	} );

	return (
		<PageHeader className="sites-dashboard-header">
			<HeaderControls>
				{ isDriveMigrationEnabled && <SitesAddNewSitePopover showCompact={ isPreviewPaneOpen } /> }
				{ ! isDriveMigrationEnabled && (
					<AddNewSiteSplitButton
						primary={ ! isPreviewPaneOpen }
						whiteSeparator={ ! isPreviewPaneOpen }
						className="sites-add-new-site-split-button"
						label={ translate( 'Add new site' ) }
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
							<span>{ translate( 'Add Jetpack to a self-hosted site' ) }</span>
						</PopoverMenuItem>
						<PopoverMenuItem
							className={ `${ popoverHoverStyles }` }
							onClick={ () => {
								recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_import' );
							} }
							href={ importSiteUrl }
							itemComponent={ LinkWithRedirect }
						>
							<DownloadIcon icon={ download } size={ 18 } />
							<span>{ translate( 'Import an existing site' ) }</span>
						</PopoverMenuItem>
					</AddNewSiteSplitButton>
				) }
			</HeaderControls>
		</PageHeader>
	);
};

export default SitesDashboardHeader;
