import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import useUpdateSiteTagsMutation from '../../sites/site-preview-pane/hooks/use-update-site-tags-mutation';
import { A4A_MIGRATED_SITE_TAG } from '../lib/constants';
import { getSiteReviewStatus } from '../lib/utils';
import { TaggedSite } from '../types';

type Props = {
	site: TaggedSite;
	fetchMigratedSites: () => void;
};

const CommissionListActions = ( { fetchMigratedSites, site }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ showRemoveSiteDialog, setShowRemoveSiteDialog ] = useState( false );
	const { mutate, isPending } = useUpdateSiteTagsMutation();

	const isPendingReview = useMemo( () => {
		const tags = site.tags.map( ( tag ) => tag.name );
		return getSiteReviewStatus( tags ) === 'pending';
	}, [ site.tags ] );

	const showActions = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const closeDropdown = useCallback( () => {
		setIsOpen( false );
	}, [] );

	const onRemoveSite = useCallback( () => {
		closeDropdown();
		// Removing the A4A_MIGRATED_SITE_TAG tag only
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
					setShowRemoveSiteDialog( false );
					dispatch(
						successNotice(
							translate( 'Successfully untagged {{strong}}%(siteUrl)s{{/strong}}.', {
								components: { strong: <strong /> },
								args: { siteUrl: site.url },
							} ),
							{ id: 'a4a-commission-list-untag-success', duration: 5000 }
						)
					);
				},
			}
		);
	}, [
		fetchMigratedSites,
		mutate,
		site,
		closeDropdown,
		setShowRemoveSiteDialog,
		dispatch,
		translate,
	] );

	// Only render actions if the site is pending review
	if ( ! isPendingReview ) {
		return null;
	}

	return (
		<div>
			<Button onClick={ showActions } ref={ buttonActionRef }>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				<PopoverMenuItem
					localizeUrl={ false }
					onClick={ () => {
						setShowRemoveSiteDialog( true );
					} }
				>
					{ translate( 'Untag site' ) }
				</PopoverMenuItem>
			</PopoverMenu>

			{ showRemoveSiteDialog && (
				<A4AConfirmationDialog
					onClose={ () => setShowRemoveSiteDialog( false ) }
					onConfirm={ onRemoveSite }
					isLoading={ isPending }
					isDisabled={ isPending }
					title={ translate( 'Untag site' ) }
					children={ translate(
						'Are you sure you want to untag {{b}}%(site)s{{/b}}? This will stop it from being considered for a migration payout.',
						{
							args: { site: site.url },
							components: {
								b: <b />,
							},
							comment: '%(site)s is the site name',
						}
					) }
				/>
			) }
		</div>
	);
};

export default CommissionListActions;
