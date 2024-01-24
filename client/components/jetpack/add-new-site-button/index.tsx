import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, WordPressLogo } from '@automattic/components';
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
	onClickUrlMenuItem?: () => void;
};

const AddNewSiteButton = ( {
	showMainButtonLabel = true,
	className,
	popoverContext,
	onToggleMenu,
	onClickAddNewSite,
	onClickWpcomMenuItem,
	onClickJetpackMenuItem,
	onClickUrlMenuItem,
}: Props ): JSX.Element => {
	const translate = useTranslate();

	const jetpackConnectUrl = 'https://wordpress.com/jetpack/connect?source=jetpack-manage';

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
			href={ jetpackConnectUrl }
		>
			<PopoverMenuItem onClick={ onClickWpcomMenuItem } href="/partner-portal/create-site">
				<WordPressLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Create a new WordPress.com site' ) }</span>
			</PopoverMenuItem>

			<PopoverMenuItem onClick={ onClickJetpackMenuItem } href={ jetpackConnectUrl }>
				<JetpackLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Connect a site to Jetpack' ) }</span>
			</PopoverMenuItem>

			{ isEnabled( 'jetpack/url-only-connection' ) && (
				<PopoverMenuItem onClick={ onClickUrlMenuItem } href="/manage/connect-url">
					<Gridicon icon="domains" size={ 18 } />
					<span>{ translate( 'Add sites by URL' ) }</span>
				</PopoverMenuItem>
			) }
		</SplitButton>
	);
};

export default AddNewSiteButton;
