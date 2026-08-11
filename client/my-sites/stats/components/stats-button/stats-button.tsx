import { Button as CalypsoButton } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface StatsButtonProps extends React.ButtonHTMLAttributes< HTMLButtonElement > {
	children?: React.ReactNode;
	primary?: boolean;
	busy?: boolean;
}

const StatsButton: React.FC< StatsButtonProps > = ( { children, primary, ...rest } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;

	if ( primary ) {
		return (
			<ButtonComponent
				variant="primary"
				primary={ isWPCOMSite ? true : undefined }
				isBusy={ rest.busy }
				{ ...rest }
			>
				{ children }
			</ButtonComponent>
		);
	}

	return <ButtonComponent { ...rest }>{ children }</ButtonComponent>;
};

export default StatsButton;
