import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, WordPressLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import BluehostLogo from 'calypso/components/bluehost-logo';
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
	onClickBluehostMenuItem?: () => void;
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
	onClickBluehostMenuItem,
	onClickUrlMenuItem,
}: Props ): JSX.Element => {
	const translate = useTranslate();

	const jetpackConnectUrl = 'https://wordpress.com/jetpack/connect?source=jetpack-manage';

	const bluehostCreateSiteUrl =
		'https://www.bluehost.com/hosting/cloud?utm_campaign=wordpresscloud_jetpack&utm_source=wordpresscom&utm_medium=referral&channelid=P61C46097236S625N0B2A151D0E0000V105';

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

			<PopoverMenuItem onClick={ onClickBluehostMenuItem } href={ bluehostCreateSiteUrl }>
				<BluehostLogo size={ 18 } />
				<span>{ translate( 'Create a new Bluehost site' ) }</span>
			</PopoverMenuItem>

			{ isEnabled( 'jetpack/url-only-connection' ) && (
				<PopoverMenuItem onClick={ onClickUrlMenuItem } href="/dashboard/connect-url">
					<Gridicon icon="domains" size={ 18 } />
					<span>{ translate( 'Add sites by URL' ) }</span>
				</PopoverMenuItem>
			) }
		</SplitButton>
	);
};

export default AddNewSiteButton;
