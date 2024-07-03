import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_DOWNLOAD_LINK_ON_GITHUB } from 'calypso/a8c-for-agencies/constants';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import A4ALogo, { LOGO_COLOR_SECONDARY_ALT } from '../a4a-logo';
import { A4A_SITES_CONNECT_URL_LINK } from '../sidebar-menu/lib/constants';
import SiteSelectorAndImporter from './site-selector-and-importer';
import type { MutableRefObject } from 'react';

type Props = {
	showMainButtonLabel?: boolean;
	className?: string;
	popoverContext?: MutableRefObject< HTMLElement | null >;
	onToggleMenu?: ( isOpen: boolean ) => void;
	onClickAddNewSite?: () => void;
	onClickA4APluginMenuItem?: () => void;
	onClickUrlMenuItem?: () => void;
};

const AddNewSiteButton = ( {
	showMainButtonLabel = true,
	className,
	popoverContext,
	onToggleMenu,
	onClickAddNewSite,
	onClickA4APluginMenuItem,
	onClickUrlMenuItem,
}: Props ): JSX.Element => {
	const translate = useTranslate();

	/** @todo Remove this line once the A4A_SITES_CONNECT_URL_LINK URL exists. */
	const showAddSitesByURLButton = false;

	const showAddSitesFromWPCOMAccount = config.isEnabled(
		'a8c-for-agencies/import-site-from-wpcom'
	);

	const isSiteSelectorAndImportedEnabled = config.isEnabled( 'a4a-site-selector-and-importer' );

	if ( isSiteSelectorAndImportedEnabled ) {
		return <SiteSelectorAndImporter showMainButtonLabel={ showMainButtonLabel } />;
	}

	return (
		<SplitButton
			popoverContext={ popoverContext }
			className={ className }
			label={ showMainButtonLabel ? translate( 'Add new site' ) : undefined }
			toggleIcon={ showMainButtonLabel ? undefined : 'plus' }
			onToggle={ onToggleMenu }
			onClick={ onClickAddNewSite }
			href={ A4A_DOWNLOAD_LINK_ON_GITHUB }
		>
			<PopoverMenuItem onClick={ onClickA4APluginMenuItem } href={ A4A_DOWNLOAD_LINK_ON_GITHUB }>
				<A4ALogo
					className="gridicon"
					size={ 18 }
					colors={ { secondary: LOGO_COLOR_SECONDARY_ALT } }
				/>
				<span>{ translate( 'Download A4A Plugin' ) }</span>
			</PopoverMenuItem>

			{ showAddSitesFromWPCOMAccount && (
				<PopoverMenuItem href="/sites/add/from-wpcom">
					<span>{ translate( 'From your WordPress.com account' ) }</span>
				</PopoverMenuItem>
			) }

			{ showAddSitesByURLButton && (
				<>
					{ /** @todo The A4A_SITES_CONNECT_URL_LINK URL does not exist yet. It will need to be migrated over from cloud.jetpack.com/dashboard/connect-url. */ }
					<PopoverMenuItem onClick={ onClickUrlMenuItem } href={ A4A_SITES_CONNECT_URL_LINK }>
						<Gridicon icon="domains" size={ 18 } />
						<span>{ translate( 'Add sites by URL' ) }</span>
					</PopoverMenuItem>
				</>
			) }
		</SplitButton>
	);
};

export default AddNewSiteButton;
