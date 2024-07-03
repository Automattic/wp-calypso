import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import { useState, useRef, useCallback } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { SiteRemoveConfirmationDialog } from '../site-remove-confirmation-dialog';
import useSiteActions from './use-site-actions';
import type { AllowedActionTypes, SiteNode } from '../types';

import './style.scss';

interface Props {
	isLargeScreen?: boolean;
	site: SiteNode;
	siteError: boolean | undefined;
}

export default function SiteActions( { isLargeScreen = false, site, siteError }: Props ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ showRemoveSiteDialog, setShowRemoveSiteDialog ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const closeDropdown = useCallback( () => {
		setIsOpen( false );
	}, [] );

	const onSelectAction = useCallback( ( action: AllowedActionTypes ) => {
		if ( action === 'remove_site' ) {
			setShowRemoveSiteDialog( true );
		}
	}, [] );

	const siteActions = useSiteActions( {
		site,
		isLargeScreen,
		siteError,
		onSelect: onSelectAction,
	} );

	return (
		<>
			<Button
				borderless
				compact
				onClick={ showActions }
				ref={ buttonActionRef }
				className={ clsx(
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
				{ siteActions
					.filter( ( action ) => action.isEnabled )
					.map( ( action ) => (
						<PopoverMenuItem
							key={ action.name }
							isExternalLink={ action.isExternalLink }
							onClick={ action.onClick }
							href={ action.href }
							className={ clsx( 'site-actions__menu-item', action.className ) }
						>
							{ action.name }
							{ action.icon && <Gridicon icon={ action.icon } size={ 18 } /> }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>

			{ showRemoveSiteDialog && (
				<SiteRemoveConfirmationDialog
					site={ site }
					onClose={ () => setShowRemoveSiteDialog( false ) }
				/>
			) }
		</>
	);
}
