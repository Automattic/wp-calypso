import { Gridicon, WordPressLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import {
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_SITES_CONNECT_URL_LINK,
} from '../sidebar-menu/lib/constants';
import type { MutableRefObject } from 'react';

const JETPACK_CONNECT_URL = 'https://wordpress.com/jetpack/connect?source=a8c-for-agencies';

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

	return (
		<SplitButton
			popoverContext={ popoverContext }
			className={ className }
			label={ showMainButtonLabel ? translate( 'Add new site' ) : undefined }
			toggleIcon={ showMainButtonLabel ? undefined : 'plus' }
			onToggle={ onToggleMenu }
			onClick={ onClickAddNewSite }
			href={ JETPACK_CONNECT_URL }
		>
			{ /** @todo The A4A_MARKETPLACE_HOSTING_WPCOM_LINK URL does not exist yet.*/ }
			<PopoverMenuItem onClick={ onClickWpcomMenuItem } href={ A4A_MARKETPLACE_HOSTING_WPCOM_LINK }>
				<WordPressLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Create a new WordPress.com site' ) }</span>
			</PopoverMenuItem>

			{ /** @todo Add support for the "a8c-for-agencies" source parameter in JETPACK_CONNECT_URL. */ }
			<PopoverMenuItem onClick={ onClickJetpackMenuItem } href={ JETPACK_CONNECT_URL }>
				<JetpackLogo className="gridicon" size={ 18 } />
				<span>{ translate( 'Connect a site to Jetpack' ) }</span>
			</PopoverMenuItem>

			{ /** @todo The A4A_SITES_CONNECT_URL_LINK URL does not exist yet. It will need to be migrated over from cloud.jetpack.com/dashboard/connect-url. */ }
			<PopoverMenuItem onClick={ onClickUrlMenuItem } href={ A4A_SITES_CONNECT_URL_LINK }>
				<Gridicon icon="domains" size={ 18 } />
				<span>{ translate( 'Add sites by URL' ) }</span>
			</PopoverMenuItem>
		</SplitButton>
	);
};

export default AddNewSiteButton;
