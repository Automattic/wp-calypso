import { FormLabel } from '@automattic/components';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useDeleteDevSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-delete-dev-site';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { SiteData } from '../../../../jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const createDeleteSiteActionModal =
	( {
		onRefetchSite,
		recordTracksEventDeleteSite,
	}: {
		onRefetchSite?: () => Promise< unknown >;
		recordTracksEventDeleteSite: () => void;
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
		recordTracksEventDeleteSite();

		const translate = useTranslate();
		const dispatch = useDispatch();
		const [ isDisabled, setIsDisabled ] = useState( true ); // Disabled by default - user needs to type the site name to enable the button

		const item = items[ 0 ];
		const siteName = item.site.value.url;
		const siteId = item.site.value.a4a_site_id || 0;

		const { mutate: deleteDevSite } = useDeleteDevSiteMutation( siteId, {
			onSuccess: () => {
				// Add 1 second delay to refetch sites to give time for site profile to be reindexed properly.
				setTimeout( () => {
					onRefetchSite?.()?.then( () => {
						closeModal?.();
						onActionPerformed?.();
						dispatch( successNotice( translate( 'The site has been successfully deleted.' ) ) );
					} );
				}, 1000 );
			},
			onError: () => {
				closeModal?.();
				onActionPerformed?.();
				dispatch( errorNotice( translate( 'An error occurred while deleting the site.' ) ) );
			},
		} );

		const onSubmit = ( event: React.FormEvent ) => {
			event.preventDefault();
			deleteDevSite();
		};

		const handleDeleteConfirmationInputChange = (
			event: React.ChangeEvent< HTMLInputElement >
		) => {
			const value = event.target.value;
			setIsDisabled( value !== siteName );
		};

		return (
			<form onSubmit={ onSubmit }>
				<p>
					{ translate( 'Are you sure you want to delete the site {{b}}%(siteName)s{{/b}}?', {
						args: { siteName },
						components: {
							b: <b />,
						},
						comment: '%(siteName)s is the site domain',
					} ) }
				</p>
				<p>
					{ translate(
						'Deletion is {{strong}}irreversible and will permanently remove all site content{{/strong}} — posts, pages, media, users, authors, domains, purchased upgrades, and premium themes.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="site-delete-confirmation-input">
						{ translate(
							'Type {{strong}}%(siteName)s{{/strong}} below to confirm you want to delete the site:',
							{
								components: {
									strong: <strong />,
								},
								args: { siteName },
								comment: '%(siteName)s is the site domain',
							}
						) }
					</FormLabel>
					<FormTextInput
						name="site-delete-confirmation-input"
						autoCapitalize="off"
						aria-required="true"
						onChange={ handleDeleteConfirmationInputChange }
					/>
				</FormFieldset>
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
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						isDestructive
						disabled={ isDisabled }
					>
						{ translate( 'Delete site' ) }
					</Button>
				</HStack>
			</form>
		);
	};

export default createDeleteSiteActionModal;
