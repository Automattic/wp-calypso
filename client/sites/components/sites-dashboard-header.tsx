import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import AddNewSiteButton from 'calypso/components/add-new-site/button';
import AddNewSiteContent from 'calypso/components/add-new-site/content';
import { MEDIA_QUERIES } from 'calypso/sites-dashboard/utils';
import 'calypso/components/add-new-site/style.scss';

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
	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const popoverMenuContext = useRef( null );
	const translate = useTranslate();

	const toggleMenu = () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	};

	return (
		<PageHeader>
			<HeaderControls>
				<AddNewSiteButton
					showMainButtonLabel={ ! isPreviewPaneOpen }
					mainButtonLabelText={ translate( 'Add new site' ) }
					isMenuVisible={ isMenuVisible }
					toggleMenu={ () => {
						recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_add' );
						toggleMenu();
					} }
					popoverMenuContext={ popoverMenuContext }
				/>

				<AddNewSiteContent
					isMenuVisible={ isMenuVisible }
					toggleMenu={ toggleMenu }
					popoverMenuContext={ popoverMenuContext }
					setMenuVisible={ setMenuVisible }
				/>
			</HeaderControls>
		</PageHeader>
	);
};

export default SitesDashboardHeader;
