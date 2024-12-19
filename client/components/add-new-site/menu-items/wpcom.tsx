import { WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon, reusableBlock, download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import freeDomain from 'calypso/assets/images/wpcom/add-new-site-free-domain.svg';
import { preventWidows } from 'calypso/lib/formatting';
import AddNewSiteMenuItem from '../menu-item';
import AddNewSitePopoverColumn from '../popover-column';
import type { AddNewSiteMenuItemsProps } from '../types';

const AddNewSiteWPCOMMenuItems = ( { setMenuVisible }: AddNewSiteMenuItemsProps ) => {
	const translate = useTranslate();

	const handleOnClick = useCallback( () => {
		// TODO: Implement the click handler
		setMenuVisible( false );
	}, [ setMenuVisible ] );

	return (
		<>
			<AddNewSitePopoverColumn heading={ translate( 'Add a new site' ) }>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'WordPress.com' ) }
					description={ preventWidows(
						translate( 'Build and grow your site, all in one powerful platform.' )
					) }
					buttonProps={ {
						onClick: () => handleOnClick,
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via Jetpack plugin' ) }
					description={ preventWidows(
						translate( 'Add a site by remotely installing the Jetpack plugin.' )
					) }
					buttonProps={ {
						onClick: () => handleOnClick,
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <img src={ pressableIcon } alt="Pressable" /> }
					heading={ translate( 'Pressable' ) }
					description={ translate( 'Optimized and hassle-free hosting for business websites.' ) }
					buttonProps={ {} }
				/>
			</AddNewSitePopoverColumn>
			<AddNewSitePopoverColumn heading={ translate( 'Migrate & Import' ) }>
				<AddNewSiteMenuItem
					icon={ <Icon icon={ reusableBlock } /> }
					heading={ translate( 'Migrate' ) }
					description={ preventWidows(
						translate( 'Bring your theme, plugins, and content to WordPress.com.' )
					) }
					buttonProps={ {
						onClick: () => handleOnClick,
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <Icon icon={ download } /> }
					heading={ translate( 'Import' ) }
					description={ preventWidows(
						translate( 'Use a backup file to import your content into a new site.' )
					) }
					buttonProps={ {
						onClick: () => handleOnClick,
					} }
				/>
			</AddNewSitePopoverColumn>
			<AddNewSitePopoverColumn>
				<AddNewSiteMenuItem
					isBanner
					icon={ <img src={ freeDomain } alt="Free domain" /> }
					heading={ translate( 'Get a Free Domain and Up to {{br/}}55% off', {
						components: { br: <br /> },
						comment: 'br is a line break',
					} ) }
					description={ preventWidows(
						translate(
							'Save up to 55% on annual plans and get a free custom domain for a year. Your next site is just a step away.'
						)
					) }
					buttonProps={ {} }
				>
					<div>
						<div className="add-new-site-popover__cta">{ translate( 'Unlock Offer →' ) }</div>
					</div>
				</AddNewSiteMenuItem>
			</AddNewSitePopoverColumn>
		</>
	);
};

export default AddNewSiteWPCOMMenuItems;
