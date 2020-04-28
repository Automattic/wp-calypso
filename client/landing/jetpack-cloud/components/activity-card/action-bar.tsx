/**
 * External dependencies
 */
import React, { FunctionComponent, useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import {
	backupDownloadPath,
	backupRestorePath,
} from 'landing/jetpack-cloud/sections/backups/paths';

interface Props {
	showActions: boolean;
	siteSlug: string;
	rewindId: string;
}

import downloadIcon from './download-icon.svg';

const ActivityCardActionBar: FunctionComponent< Props > = ( {
	children,
	siteSlug,
	rewindId,
	showActions = false,
} ) => {
	const menuRef = useRef();
	const translate = useTranslate();

	const [ showMenu, setShowMenu ] = useState( false );

	const toggleShowMenu = () => setShowMenu( ! showMenu );
	const closeMenu = () => setShowMenu( false );

	const renderActions = () => {
		<>
			<Button
				compact
				borderless
				className="activity-card__actions-button"
				onClick={ () => toggleShowMenu }
				ref={ menuRef }
			>
				{ translate( 'Actions' ) }
				<Gridicon icon="add" className="activity-card__actions-icon" />
			</Button>
			<PopoverMenu
				context={ menuRef.current }
				isVisible={ showMenu }
				onClose={ closeMenu }
				className="activity-card__popover"
			>
				<Button
					href={ backupRestorePath( siteSlug, rewindId ) }
					className="activity-card__restore-button"
				>
					{ translate( 'Restore to this point' ) }
				</Button>
				<Button
					borderless
					compact
					isPrimary={ false }
					href={ backupDownloadPath( siteSlug, rewindId ) }
					className="activity-card__download-button"
				>
					<img
						src={ downloadIcon }
						className="activity-card__download-icon"
						role="presentation"
						alt=""
					/>
					{ translate( 'Download backup' ) }
				</Button>
			</PopoverMenu>
		</>;
	};

	return (
		<div
			className={
				! children && showActions
					? 'activity-card__activity-actions-reverse'
					: 'activity-card__activity-actions'
			}
		>
			{ children }
			{ showActions && renderActions() }
		</div>
	);
};

export default ActivityCardActionBar;
