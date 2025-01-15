import { useBreakpoint } from '@automattic/viewport-react';
import { useRef, useState, useCallback, useMemo } from 'react';
import AddNewSiteButton from './button';
import AddNewSiteContent from './content';
import AddNewSiteContext from './context';

import './style.scss';

const AddNewSite = () => {
	const isNarrowView = useBreakpoint( '<660px' );

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ visibleModalType, setVisibleModalType ] = useState( '' );

	const popoverMenuContext = useRef( null );

	const toggleMenu = useCallback( () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	}, [] );

	// Memoize the context value to avoid unnecessary re-renders
	const contextValue = useMemo(
		() => ( {
			visibleModalType,
			setVisibleModalType,
		} ),
		[ visibleModalType, setVisibleModalType ]
	);

	const props = {
		isMenuVisible,
		toggleMenu,
		popoverMenuContext,
		setMenuVisible,
	};

	return (
		<AddNewSiteContext.Provider value={ contextValue }>
			<AddNewSiteButton
				showMainButtonLabel={ ! isNarrowView }
				isMenuVisible={ isMenuVisible }
				toggleMenu={ toggleMenu }
				popoverMenuContext={ popoverMenuContext }
			/>
			<AddNewSiteContent { ...props } />
		</AddNewSiteContext.Provider>
	);
};

export default AddNewSite;
