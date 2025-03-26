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

const SupportBlock = ( {
	useDialog = false,
	translate,
}: {
	useDialog?: boolean;
} & LocalizeProps ) => {
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setShowHelpCenter, setIsMinimized } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		if ( isMinimized ) {
			setIsMinimized( false );
		} else {
			setShowHelpCenter( ! show );
		}
	};

	return (
		<div className="support-block">
			{ useDialog ? (
				<>
					{ translate( '{{button}}Need help?{{/button}}', {
						components: {
							button: <Button variant="link" onClick={ handleToggleHelpCenter } />,
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

export default localize( SupportBlock );
