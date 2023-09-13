import { Gridicon } from '@automattic/components';
import { FloatingNavigator } from '@automattic/launchpad-navigator';
import classnames from 'classnames';
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
				className={ classnames( 'masterbar__item-launchpad-navigator', {
					'is-active': launchpadIsVisible,
				} ) }
				tooltip={ translate( 'My tasks' ) }
				icon={ <Gridicon icon="checkmark-circle" /> }
			/>
			{ launchpadIsVisible && (
				<div className="masterbar__launchpad-navigator">
					<FloatingNavigator siteSlug={ siteSlug } />
				</div>
			) }
		</>
	);
};

export default MasterbarLaunchpadNavigator;
