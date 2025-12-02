import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { localize, LocalizeProps } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

const SupportLink = ( {
	onShowHelpAssistant = () => {},
	translate,
}: {
	onShowHelpAssistant?: () => void;
} & LocalizeProps ) => {
	const sectionName = useSelector( getSectionName );
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );
	const { setShowHelpCenter, setIsMinimized, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const handleShowHelpAssistant = useCallback( async () => {
		onShowHelpAssistant();

		setNavigateToRoute( '/odie' );

		if ( ! show ) {
			setShowHelpCenter( true );

			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );
		}

		if ( isMinimized ) {
			setIsMinimized( false );
		}
	}, [
		onShowHelpAssistant,
		setNavigateToRoute,
		show,
		setShowHelpCenter,
		sectionName,
		isMinimized,
		setIsMinimized,
	] );

	return (
		<div className="support-block">
			{ translate( '{{button}}Need help?{{/button}}', {
				components: {
					button: <Button variant="link" onClick={ handleShowHelpAssistant } />,
				},
			} ) }
		</div>
	);
};

export default localize( SupportLink );
