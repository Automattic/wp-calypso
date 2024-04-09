import { Card, Button } from '@automattic/components';
import { chevronRightSmall, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { WriteIcon } from 'calypso/layout/masterbar/write-icon';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface ActionProps {
	icon: ReactNode;
	href: string;
	text: string;
}
const Action: FC< ActionProps > = ( { icon, href, text } ) => {
	return (
		<li className="action">
			<Button className="action-button" plain href={ href }>
				<span className="action-text">
					{ icon }
					{ text }
				</span>
				<Icon icon={ chevronRightSmall } />
			</Button>
		</li>
	);
};

const QuickActionsCard: FC = () => {
	const site = useSelector( getSelectedSite );
	const editorUrl = useSelector( ( state ) => getEditorUrl( state, site?.ID ) );
	const translate = useTranslate();

	return (
		<Card className="top-card">
			<CardHeading isBold>{ translate( 'Quick actions' ) }</CardHeading>
			<ul className="actions-list">
				<Action icon={ <WriteIcon /> } href={ editorUrl } text={ translate( 'Write post' ) } />
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-admin-appearance action-icon__dashicon" /> }
					href={ `/themes/${ site?.slug }` }
					text={ translate( 'Change theme' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-admin-plugins action-icon__dashicon" /> }
					href={ `/plugins/${ site?.slug }` }
					text={ translate( 'Install plugins' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-chart-bar action-icon__dashicon" /> }
					href={ `/stats/${ site?.slug }` }
					text={ translate( 'See JetPack Stats' ) }
				/>
			</ul>
		</Card>
	);
};

export default QuickActionsCard;
