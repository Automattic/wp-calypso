import { FloatingNavigator } from '@automattic/launchpad-navigator';
import classnames from 'classnames';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Item from './item';

const MasterbarLaunchpadNavigator = () => {
	const [ launchpadIsVisible, setLaunchpadIsVisible ] = useState( false );

	const toggleLaunchpadIsVisible = () => {
		setLaunchpadIsVisible( ! launchpadIsVisible );
	};

	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<>
			<Item
				onClick={ toggleLaunchpadIsVisible }
				className={ classnames( 'masterbar__item-launchpad-navigator', {
					'is-active': launchpadIsVisible,
				} ) }
				tooltip="Open tasks"
				icon={ <span>X</span> }
			/>
			{ launchpadIsVisible && (
				<div className="masterbar__launchpad-navigator">
					<FloatingNavigator siteSlug={ siteSlug } userId={ 0 } />
				</div>
			) }
		</>
	);
};

export default MasterbarLaunchpadNavigator;
