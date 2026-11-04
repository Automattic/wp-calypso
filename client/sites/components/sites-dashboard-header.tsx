import styled from '@emotion/styled';
import { SitesAddNewSitePopover } from 'calypso/components/sites-add-new-site';
import { MEDIA_QUERIES } from 'calypso/sites-dashboard/utils';
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

const SitesDashboardHeader: React.FC< SitesDashboardHeaderProps > = ( { isPreviewPaneOpen } ) => {
	return (
		<PageHeader className="sites-dashboard-header">
			<HeaderControls>
				<SitesAddNewSitePopover showCompact={ isPreviewPaneOpen } context="sites-dashboard" />
			</HeaderControls>
		</PageHeader>
	);
};

export default SitesDashboardHeader;
