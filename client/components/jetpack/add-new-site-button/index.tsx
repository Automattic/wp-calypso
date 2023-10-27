import { WordPressLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import type { MutableRefObject } from 'react';

type Props = {
	showMainButtonLabel?: boolean;
	className?: string;
	popoverContext?: MutableRefObject< HTMLElement | null >;
	onToggleMenu?: ( isOpen: boolean ) => void;
	onClickAddNewSite?: () => void;
	onClickWpcomMenuItem?: () => void;
	onClickJetpackMenuItem?: () => void;
};

const AddNewSiteButton = ( {
	showMainButtonLabel = true,
	className,
	popoverContext,
	onToggleMenu,
	onClickAddNewSite,
	onClickWpcomMenuItem,
	onClickJetpackMenuItem,
}: Props ): JSX.Element => {
	const translate = useTranslate();

	return (
		<SplitButton
			primary
			whiteSeparator
			popoverContext={ popoverContext }
			className={ className }
			label={ showMainButtonLabel ? translate( 'Add new site' ) : undefined }
			toggleIcon={ showMainButtonLabel ? undefined : 'plus' }
			onToggle={ onToggleMenu }
			onClick={ onClickAddNewSite }
			href="https://wordpress.com/jetpack/connect"
		>
			<PopoverMenuItem onClick={ onClickWpcomMenuItem } href="/partner-portal/create-site">
				<WordPressLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Create a new WordPress.com site' ) }</span>
			</PopoverMenuItem>

			<PopoverMenuItem
				onClick={ onClickJetpackMenuItem }
				href="https://wordpress.com/jetpack/connect"
			>
				<JetpackLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Connect a site to Jetpack' ) }</span>
			</PopoverMenuItem>
		</SplitButton>
	);
};

export default AddNewSiteButton;
