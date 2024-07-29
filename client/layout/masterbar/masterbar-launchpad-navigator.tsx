import { FloatingNavigator, LaunchpadNavigatorIcon } from '@automattic/launchpad-navigator';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();

	return (
		<>
			<Item
				onClick={ toggleLaunchpadIsVisible }
				className={ clsx( 'masterbar__item-launchpad-navigator', {
					'is-active': launchpadIsVisible,
				} ) }
				tooltip={ translate( 'My tasks' ) }
				icon={ <LaunchpadNavigatorIcon siteSlug={ siteSlug } /> }
			/>
			{ launchpadIsVisible && (
				<div className="masterbar__launchpad-navigator">
					<FloatingNavigator
						siteSlug={ siteSlug }
						toggleLaunchpadIsVisible={ setLaunchpadIsVisible }
					/>
				</div>
			) }
		</>
	);
};

export default MasterbarLaunchpadNavigator;
