import { FloatingNavigator, LaunchpadNavigatorIcon } from '@automattic/launchpad-navigator';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Item from './item';

const MasterbarLaunchpadNavigator = () => {
	const [ launchpadIsVisible, setLaunchpadIsVisible ] = useState( false );

	const toggleLaunchpadIsVisible = () => {
		setLaunchpadIsVisible( ! launchpadIsVisible );
	};

	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();

	if ( ! siteId ) {
		return null;
	}

	return (
		<>
			<Item
				onClick={ toggleLaunchpadIsVisible }
				className={ classnames( 'masterbar__item-launchpad-navigator', {
					'is-active': launchpadIsVisible,
				} ) }
				tooltip={ translate( 'My tasks' ) }
				icon={ <LaunchpadNavigatorIcon siteId={ siteId } /> }
			/>
			{ launchpadIsVisible && (
				<div className="masterbar__launchpad-navigator">
					<FloatingNavigator siteId={ siteId } toggleLaunchpadIsVisible={ setLaunchpadIsVisible } />
				</div>
			) }
		</>
	);
};

export default MasterbarLaunchpadNavigator;
