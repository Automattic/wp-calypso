import { HelpCenter } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { localize, LocalizeProps } from 'i18n-calypso';
import ActionPanelLink from 'calypso/components/action-panel/link';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

const SupportLink = ( {
	onCloseEligibilityDialog,
	translate,
	useHelpCenter = false,
}: {
	onCloseEligibilityDialog: () => void;
	useHelpCenter?: boolean;
} & LocalizeProps ) => {
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setShowHelpCenter, setIsMinimized } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleOpenHelpCenter = () => {
		onCloseEligibilityDialog();

		if ( ! show ) {
			setShowHelpCenter( true );
		}

		if ( isMinimized ) {
			setIsMinimized( false );
		}
	};

	return (
		<div className="support-block">
			{ useHelpCenter ? (
				<>
					{ translate( '{{button}}Need help?{{/button}}', {
						components: {
							button: <Button variant="link" onClick={ handleOpenHelpCenter } />,
						},
					} ) }
				</>
			) : (
				<>
					<span>{ translate( 'Need help?' ) }</span>
					{ translate( '{{a}}Contact support{{/a}}', {
						components: {
							a: <ActionPanelLink href="/help/contact" />,
						},
					} ) }
				</>
			) }
		</div>
	);
};

export default localize( SupportLink );
