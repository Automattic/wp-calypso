import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import useUpdateSiteTagsMutation from '../../sites/site-preview-pane/hooks/use-update-site-tags-mutation';
import { A4A_MIGRATED_SITE_TAG } from '../lib/constants';
import { TaggedSite } from '../types';

type Props = {
	site: TaggedSite;
	fetchMigratedSites: () => void;
};

const CommissionListActions = ( { fetchMigratedSites, site }: Props ) => {
	const translate = useTranslate();
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ showRemoveSiteDialog, setShowRemoveSiteDialog ] = useState( false );
	const { mutate, isPending } = useUpdateSiteTagsMutation();

	const showActions = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const closeDropdown = useCallback( () => {
		setIsOpen( false );
	}, [] );

	const onRemoveSite = useCallback( () => {
		closeDropdown();
		const newTags = site.tags.reduce( ( acc, tag ) => {
			if ( tag.name === A4A_MIGRATED_SITE_TAG ) {
				return acc;
			}
			acc.push( tag.name );
			return acc;
		}, [] as string[] );
		mutate(
			{ siteId: site.id, tags: newTags },
			{
				onSuccess: () => {
					fetchMigratedSites();
				},
			}
		);
	}, [ fetchMigratedSites, mutate, site, closeDropdown ] );

	return (
		<div>
			<Button
				onClick={ showActions }
				ref={ buttonActionRef }
				className={ clsx( 'site-actions__actions-large-screen' ) }
			>
				<Gridicon icon="ellipsis" size={ 18 } className="site-actions__all-actions" />
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				<PopoverMenuItem
					key="untag-site"
					localizeUrl={ false }
					onClick={ () => {
						setShowRemoveSiteDialog( true );
					} }
					className={ clsx( 'site-actions__menu-item' ) }
				>
					{ translate( 'Untag site' ) }
				</PopoverMenuItem>
			</PopoverMenu>

			{ showRemoveSiteDialog && (
				<A4AConfirmationDialog
					onClose={ () => setShowRemoveSiteDialog( false ) }
					onConfirm={ onRemoveSite }
					isLoading={ isPending }
					title={ translate( 'Untag site' ) }
					className="untag-site__dialog"
					children={ translate(
						'Are you sure you want to remove the site {{b}}%(siteURL)s{{/b}} from the dashboard?',
						{
							args: { siteURL: site.url },
							components: {
								b: <b />,
							},
							comment: '%(siteName)s is the site name',
						}
					) }
				/>
			) }
		</div>
	);
};

export default CommissionListActions;
