import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import { useState, useRef, useCallback } from 'react';
import useRemoveSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-remove-site';
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
	onRefetchSite?: () => Promise< unknown >;
}

export default function SiteActions( {
	isLargeScreen = false,
	site,
	siteError,
	onRefetchSite,
}: Props ) {
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
							} );
						}, 1000 );
					},
				}
			);
		}
	}, [ onRefetchSite, removeSite, site.value?.a4a_site_id ] );

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
					onConfirm={ onRemoveSite }
					busy={ isPending || isPendingRefetch }
				/>
			) }
		</>
	);
}
