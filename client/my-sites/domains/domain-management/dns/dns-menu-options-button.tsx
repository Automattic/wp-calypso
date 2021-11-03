/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { Icon, moreVertical, redo } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import './dns-breadcrumb-button.scss';

function DnsMenuOptionsButton(): JSX.Element {
	const { __ } = useI18n();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const optionsButtonRef = useRef( null );

	const toggleMenu = useCallback( () => {
		setMenuVisible( ! isMenuVisible );
	}, [ isMenuVisible ] );

	const closeMenu = useCallback( () => setMenuVisible( false ), [] );
	return (
		<>
			<Button
				className="dns__breadcrumb-button ellipsis"
				onClick={ toggleMenu }
				ref={ optionsButtonRef }
			>
				<Icon icon={ moreVertical } className="gridicon" />
			</Button>
			<PopoverMenu
				className="dns__breadcrumb-button popover"
				isVisible={ isMenuVisible }
				onClose={ closeMenu }
				context={ optionsButtonRef.current }
				position="bottom"
			>
				<PopoverMenuItem onClick={ () => null }>
					<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
					{ __( 'Restore default records' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
}

export default DnsMenuOptionsButton;
