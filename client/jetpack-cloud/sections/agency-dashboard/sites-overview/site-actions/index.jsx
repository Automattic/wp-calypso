import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import './style.scss';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

const SiteActions = ( { isLargeScreen, site } ) => {
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );

	const ref = useRef();

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const siteUrl = site?.value?.url;
	const siteError = site?.error;
	const siteId = site?.value?.blog_id;

	return (
		<>
			<div
				onClick={ showActions }
				onKeyPress={ showActions }
				role="button"
				tabIndex="0"
				ref={ ref }
				className={ classNames(
					isLargeScreen
						? 'site-actions__actions-large-screen'
						: 'site-actions__actions-small-screen'
				) }
			>
				<Gridicon icon="ellipsis" size={ 18 } className="site-actions__all-actions" />
			</div>
			<PopoverMenu
				context={ ref.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom"
			>
				{ ! siteError && (
					<>
						<PopoverMenuItem className="site-actions__menu-item">
							<a href={ `/partner-portal/issue-license/?site_id=${ siteId }` }>
								{ translate( 'Issue new license' ) }
								<Gridicon
									icon="chevron-right"
									className="site-actions__table-action-icon"
									size={ 18 }
								/>
							</a>
						</PopoverMenuItem>
						<PopoverMenuItem className="site-actions__menu-item">
							<a href={ `/activity-log/${ siteUrl }` }>
								{ translate( 'View activity' ) }
								<Gridicon
									icon="chevron-right"
									className="site-actions__table-action-icon"
									size={ 18 }
								/>
							</a>
						</PopoverMenuItem>
					</>
				) }
				<PopoverMenuItem className="site-actions__menu-item">
					<a href={ `https://${ siteUrl }/` }>
						{ translate( 'View site' ) }
						<Gridicon icon="external" className="site-actions__table-action-icon" size={ 18 } />
					</a>
				</PopoverMenuItem>
				<PopoverMenuItem className="site-actions__menu-item">
					<a href={ `https://${ siteUrl }/wp-admin/admin.php?page=jetpack#/dashboard` }>
						{ translate( 'Visit WP Admin' ) }
						<Gridicon icon="external" className="site-actions__table-action-icon" size={ 18 } />
					</a>
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
};

export default SiteActions;
