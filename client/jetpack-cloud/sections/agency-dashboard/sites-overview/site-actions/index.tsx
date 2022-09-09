import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getActionEventName } from '../utils';
import type { SiteNode, AllowedActionTypes } from '../types';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	isLargeScreen?: boolean;
	site: SiteNode;
	siteError: boolean | undefined;
}

export default function SiteActions( {
	isLargeScreen = false,
	site,
	siteError,
}: Props ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isOpen, setIsOpen ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const siteUrl = site?.value?.url;
	const siteUrlWithScheme = site?.value?.url_with_scheme;
	const siteId = site?.value?.blog_id;

	const handleClickMenuItem = ( actionType: AllowedActionTypes ) => {
		const eventName = getActionEventName( actionType, isLargeScreen );
		dispatch( recordTracksEvent( eventName ) );
	};

	return (
		<>
			<Button
				borderless
				compact
				onClick={ showActions }
				ref={ buttonActionRef }
				className={ classNames(
					isLargeScreen
						? 'site-actions__actions-large-screen'
						: 'site-actions__actions-small-screen'
				) }
			>
				<Gridicon icon="ellipsis" size={ 18 } className="site-actions__all-actions" />
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				{ ! siteError && (
					<>
						<PopoverMenuItem
							onClick={ () => handleClickMenuItem( 'issue_license' ) }
							href={ `/partner-portal/issue-license/?site_id=${ siteId }&source=dashboard` }
							className="site-actions__menu-item"
						>
							{ translate( 'Issue new license' ) }
						</PopoverMenuItem>
						<PopoverMenuItem
							onClick={ () => handleClickMenuItem( 'view_activity' ) }
							href={ `/activity-log/${ siteUrl }` }
							className="site-actions__menu-item"
						>
							{ translate( 'View activity' ) }
						</PopoverMenuItem>
					</>
				) }
				<PopoverMenuItem
					isExternalLink
					onClick={ () => handleClickMenuItem( 'view_site' ) }
					href={ siteUrlWithScheme }
					className="site-actions__menu-item"
				>
					{ translate( 'View site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem
					isExternalLink
					onClick={ () => handleClickMenuItem( 'visit_wp_admin' ) }
					href={ `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack#/dashboard` }
					className="site-actions__menu-item"
				>
					{ translate( 'Visit WP Admin' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
}
