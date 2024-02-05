import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

type AddProfileLinksButtonsProps = {
	disabled?: boolean;
	showPopoverMenu?: boolean;
	onShowPopoverMenu: () => void;
	onClosePopoverMenu: () => void;
	onShowAddWordPress: () => void;
	onShowAddOther: () => void;
};

const AddProfileLinksButtons = ( {
	disabled = false,
	showPopoverMenu = false,
	onShowPopoverMenu,
	onClosePopoverMenu,
	onShowAddWordPress,
	onShowAddOther,
}: AddProfileLinksButtonsProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const popoverContext = useRef( null );

	const recordClickEvent = ( action: string ) => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on ' + action ) );
	};

	const handleAddWordPressSiteButtonClick = () => {
		recordClickEvent( 'Add a WordPress Site Button' );
		onShowAddWordPress();
	};

	const handleOtherSiteButtonClick = () => {
		recordClickEvent( 'Add Other Site Button' );
		onShowAddOther();
	};

	return (
		<>
			<Button
				ref={ popoverContext }
				compact
				disabled={ disabled }
				onClick={ showPopoverMenu ? onClosePopoverMenu : onShowPopoverMenu }
			>
				<Gridicon icon="add-outline" />
				<span>{ translate( 'Add' ) }</span>
			</Button>
			{ showPopoverMenu && (
				<PopoverMenu isVisible onClose={ onClosePopoverMenu } context={ popoverContext.current }>
					<PopoverMenuItem onClick={ handleAddWordPressSiteButtonClick }>
						{ translate( 'Add WordPress Site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ handleOtherSiteButtonClick }>
						{ translate( 'Add URL' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			) }
		</>
	);
};

export default AddProfileLinksButtons;
