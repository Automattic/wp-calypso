import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import './style.scss';

const SiteActions = ( { isLargeScreen, site } ) => {
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );

	const buttonActionRef = useRef();

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const siteUrl = site?.value?.url;
	const siteError = site?.error;
	const siteId = site?.value?.blog_id;

	const handleClickMenuItem = () => {
		// Handle track event here
	};

	return (
		<>
			<div
				onClick={ showActions }
				onKeyPress={ showActions }
				role="button"
				tabIndex="0"
				ref={ buttonActionRef }
				className={ classNames(
					isLargeScreen
						? 'site-actions__actions-large-screen'
						: 'site-actions__actions-small-screen'
				) }
			>
				<Gridicon icon="ellipsis" size={ 18 } className="site-actions__all-actions" />
			</div>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom"
			>
				{ ! siteError && (
					<>
						<PopoverMenuItem
							onClick={ () => handleClickMenuItem( 'issue-new-license' ) }
							href={ `/partner-portal/issue-license/?site_id=${ siteId }` }
							className="site-actions__menu-item"
							icon="chevron-right"
						>
							{ translate( 'Issue new license' ) }
						</PopoverMenuItem>
						<PopoverMenuItem
							onClick={ () => handleClickMenuItem( 'view-activity' ) }
							href={ `/activity-log/${ siteUrl }` }
							className="site-actions__menu-item"
							icon="chevron-right"
						>
							{ translate( 'View activity' ) }
						</PopoverMenuItem>
					</>
				) }
				<PopoverMenuItem
					isExternalLink
					onClick={ () => handleClickMenuItem( 'view-site' ) }
					href={ `https://${ siteUrl }` }
					className="site-actions__menu-item"
				>
					{ translate( 'View site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem
					isExternalLink
					onClick={ () => handleClickMenuItem( 'visit-wp-admin' ) }
					href={ `https://${ siteUrl }/wp-admin/admin.php?page=jetpack#/dashboard` }
					className="site-actions__menu-item"
				>
					{ translate( 'Visit WP Admin' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
};

export default SiteActions;
