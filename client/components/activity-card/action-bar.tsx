/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useRef, useState } from 'react';

/**
 * Internal dependencies
 */
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import { Button } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';
import PopoverMenu from 'calypso/components/popover/menu';

interface Props {
	rewindId: string;
	showActions: boolean;
	siteSlug: string;
}

const ActivityCardActionBar: FunctionComponent< Props > = ( {
	children,
	rewindId,
	showActions = true,
	siteSlug,
} ) => {
	const actionMenuRef = useRef( null );
	const translate = useTranslate();

	const [ showMenu, setShowMenu ] = useState( false );
	const toggleMenu = () => setShowMenu( ! showMenu );
	const closeMenu = () => setShowMenu( false );

	const renderActions = () => (
		<>
			<Button
				compact
				borderless
				className="activity-card__action-bar-menu-button"
				onClick={ toggleMenu }
				ref={ actionMenuRef }
			>
				<span>{ translate( 'Actions' ) }</span>
				<Gridicon icon="add" className="activity-card__actions-icon" />
			</Button>
			<PopoverMenu
				context={ actionMenuRef.current }
				isVisible={ showMenu }
				onClose={ closeMenu }
				className="activity-card__action-bar-menu-popover"
			>
				<Button href={ backupRestorePath( siteSlug, rewindId ) }>
					{ translate( 'Restore to this point' ) }
				</Button>
				<Button
					borderless
					className="activity-card__action-bar-download-button"
					href={ backupDownloadPath( siteSlug, rewindId ) }
				>
					<img src="/calypso/images/illustrations/download.svg" role="presentation" alt="" />
					<span>{ translate( 'Download backup' ) }</span>
				</Button>
			</PopoverMenu>
		</>
	);

	return (
		<div
			className={
				! children && showActions
					? 'activity-card__action-bar-reverse'
					: 'activity-card__action-bar'
			}
		>
			{ children }
			{ showActions && renderActions() }
		</div>
	);
};

export default ActivityCardActionBar;
