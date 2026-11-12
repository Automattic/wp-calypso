import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import useDeleteDevSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-delete-dev-site';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import './style.scss';

type Props = {
	siteId: number;
	siteDomain: string;
	onClose: () => void;
	onSiteDeleted?: () => void;
	busy?: boolean;
};

export function DevSiteDeleteConfirmationDialog( {
	siteId,
	siteDomain,
	onSiteDeleted,
	onClose,
	busy,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ isDisabled, setIsDisabled ] = useState( true ); // Disabled by default - user needs to type the site name to enable the button
	const title = translate( 'Delete site' );

	const { mutate: deleteDevSite, isPending: isDeleting } = useDeleteDevSiteMutation( siteId, {
		onSuccess: () => {
			onSiteDeleted?.();
		},
		onError: () => {
			dispatch( errorNotice( translate( 'An error occurred while deleting the site.' ) ) );
		},
	} );

	const handleDeleteConfirmationInputChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const value = event.target.value;
		setIsDisabled( value !== siteDomain );
	};

	return (
		<A4AConfirmationDialog
			className="dev-site-delete-confirmation-dialog"
			title={ title }
			onClose={ onClose }
			onConfirm={ deleteDevSite }
			ctaLabel={ translate( 'Delete site' ) }
			isLoading={ busy || isDeleting }
			isDisabled={ isDisabled }
			isDestructive
		>
			<p>
				{ translate( 'Are you sure you want to delete the site {{b}}%(siteDomain)s{{/b}}?', {
					args: { siteDomain },
					components: {
						b: <b />,
					},
					comment: '%(siteDomain)s is the site domain',
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
						'Type {{strong}}%(siteDomain)s{{/strong}} below to confirm you want to delete the site:',
						{
							components: {
								strong: <strong />,
							},
							args: { siteDomain },
							comment: '%(siteDomain)s is the site domain',
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
		</A4AConfirmationDialog>
	);
}
