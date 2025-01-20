import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useRemoveSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-remove-site';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import type { SiteData } from '../../../../jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const createRemoveSiteActionModal =
	( {
		onRefetchSite,
		recordTracksEventRemoveSite,
	}: {
		onRefetchSite?: () => Promise< unknown >;
		recordTracksEventRemoveSite: () => void;
	} ) =>
	( {
		items,
		closeModal,
		onActionPerformed,
	}: {
		items: SiteData[];
		closeModal: () => void;
		onActionPerformed?: () => void;
	} ) => {
		const translate = useTranslate();
		const dispatch = useDispatch();
		const { mutate: removeSite } = useRemoveSiteMutation();

		recordTracksEventRemoveSite();

		const item = items[ 0 ];
		const siteName = item.site.value.url;
		const siteId = item.site.value.a4a_site_id;

		const onRemoveSite = () => {
			if ( ! siteId ) {
				return;
			}

			removeSite(
				{ siteId },
				{
					onSuccess: () => {
						// Add 1 second delay to refetch sites to give time for site profile to be reindexed properly.
						setTimeout( () => {
							onRefetchSite?.()?.then( () => {
								closeModal?.();
								onActionPerformed?.();
								dispatch( successNotice( translate( 'The site has been successfully removed.' ) ) );
							} );
						}, 1000 );
					},
				}
			);
		};

		const onSubmit = ( event: React.FormEvent ) => {
			event.preventDefault();
			onRemoveSite();
		};

		return (
			<form onSubmit={ onSubmit }>
				{ translate(
					'Are you sure you want to remove the site {{b}}%(siteName)s{{/b}} from the dashboard?',
					{
						args: { siteName },
						components: {
							b: <b />,
						},
						comment: '%(siteName)s is the site name',
					}
				) }
				<HStack justify="right">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => {
							closeModal?.();
						} }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" type="submit" isDestructive>
						{ translate( 'Remove site' ) }
					</Button>
				</HStack>
			</form>
		);
	};

export default createRemoveSiteActionModal;
