import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback } from 'react';
import useRemoveSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-remove-site';
import { SiteRemoveConfirmationDialog } from 'calypso/a8c-for-agencies/sections/sites/site-remove-confirmation-dialog';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import useSiteActions from './use-site-actions';
import type { AllowedActionTypes, SiteNode } from '../types';

import './style.scss';

interface Props {
	isLargeScreen?: boolean;
	isDevSite?: boolean;
	site: SiteNode;
	siteError: boolean | undefined;
	onRefetchSite?: () => Promise< unknown >;
}

export default function SiteActions( {
	isLargeScreen = false,
	isDevSite,
	site,
	siteError,
	onRefetchSite,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isOpen, setIsOpen ] = useState( false );
	const [ showRemoveSiteDialog, setShowRemoveSiteDialog ] = useState( false );
	const [ isPendingRefetch, setIsPendingRefetch ] = useState( false );

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
		isDevSite,
		siteError,
		onSelect: onSelectAction,
	} );

	const { mutate: removeSite, isPending } = useRemoveSiteMutation();

	const onRemoveSite = useCallback( () => {
		if ( site.value?.a4a_site_id ) {
			removeSite(
				{ siteId: site.value?.a4a_site_id },
				{
					onSuccess: () => {
						setIsPendingRefetch( true );
						// Add 1 second delay to refetch sites to give time for site profile to be reindexed properly.
						setTimeout( () => {
							onRefetchSite?.()?.then( () => {
								setIsPendingRefetch( false );
								setShowRemoveSiteDialog( false );
								dispatch( successNotice( translate( 'The site has been successfully removed.' ) ) );
							} );
						}, 1000 );
					},
				}
			);
		}
	}, [ dispatch, onRefetchSite, removeSite, site.value?.a4a_site_id, translate ] );

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
					siteName={ site.value?.url || '' }
					onClose={ () => setShowRemoveSiteDialog( false ) }
					onConfirm={ onRemoveSite }
					busy={ isPending || isPendingRefetch }
				/>
			) }
		</>
	);
}
