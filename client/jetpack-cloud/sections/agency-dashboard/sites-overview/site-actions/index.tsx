import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getActionEventName from './get-action-event-name';
import type { SiteNode, AllowedActionTypes } from '../types';

import './style.scss';

interface Props {
	isLargeScreen?: boolean;
	site: SiteNode;
	siteError: boolean | undefined;
}

export default function SiteActions( { isLargeScreen = false, site, siteError }: Props ) {
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
	const siteHasBackup = site?.value?.has_backup;

	const handleClickMenuItem = ( actionType: AllowedActionTypes ) => {
		const eventName = getActionEventName( actionType, isLargeScreen );
		dispatch( recordTracksEvent( eventName ) );
	};

	const siteSlug = urlToSlug( siteUrl );

	const siteActions = [
		{
			name: translate( 'Issue new license' ),
			href: `/partner-portal/issue-license/?site_id=${ siteId }&source=dashboard`,
			onClick: () => handleClickMenuItem( 'issue_license' ),
			isExternalLink: false,
			isEnabled: ! siteError,
		},
		{
			name: translate( 'View activity' ),
			href: `/activity-log/${ siteSlug }`,
			onClick: () => handleClickMenuItem( 'view_activity' ),
			isExternalLink: false,
			isEnabled: ! siteError,
		},
		{
			name: translate( 'Copy this site' ),
			href: `/backup/${ siteSlug }/clone`,
			onClick: () => handleClickMenuItem( 'clone_site' ),
			isExternalLink: false,
			isEnabled: siteHasBackup,
		},
		{
			name: translate( 'Site settings' ),
			href: `/settings/${ siteSlug }`,
			onClick: () => handleClickMenuItem( 'site_settings' ),
			isExternalLink: false,
			isEnabled: siteHasBackup,
		},
		{
			name: translate( 'View site' ),
			href: siteUrlWithScheme,
			onClick: () => handleClickMenuItem( 'view_site' ),
			isExternalLink: true,
			isEnabled: true,
		},
		{
			name: translate( 'Visit WP Admin' ),
			href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack#/dashboard`,
			onClick: () => handleClickMenuItem( 'visit_wp_admin' ),
			isExternalLink: true,
			isEnabled: true,
		},
	];

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
				{ siteActions.map(
					( action ) =>
						action.isEnabled && (
							<PopoverMenuItem
								key={ action.name }
								isExternalLink={ action.isExternalLink }
								onClick={ action.onClick }
								href={ action.href }
								className="site-actions__menu-item"
							>
								{ action.name }
							</PopoverMenuItem>
						)
				) }
			</PopoverMenu>
		</>
	);
}
