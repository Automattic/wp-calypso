import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { getSiteTitle } from 'calypso/state/signup/steps/site-title/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';

const ExclamationIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="90" height="89" fill="none" viewBox="0 0 90 89">
		<path
			fill="#FFA555"
			d="M39.18 83.895c19.46 0 35.237-15.776 35.237-35.237 0-19.462-15.776-35.238-35.238-35.238-19.46 0-35.237 15.776-35.237 35.237 0 19.462 15.776 35.238 35.237 35.238z"
		></path>
		<path
			fill="#003C65"
			d="M40.78 73.049c-1.067-1.05-1.6-2.344-1.6-3.896 0-1.535.533-2.844 1.6-3.895 1.066-1.05 2.392-1.584 3.96-1.584s2.893.533 3.96 1.584c1.067 1.05 1.6 2.344 1.6 3.895 0 1.536-.533 2.845-1.6 3.896-1.067 1.05-2.392 1.584-3.96 1.584-1.584-.016-2.894-.533-3.96-1.584zm-.76-59.63h9.424l-.712 40.492H40.7L40.02 13.42z"
		></path>
		<path
			stroke="#003C65"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeMiterlimit="10"
			strokeWidth="1.8"
			d="M88.884 44.31c-.986 57.753-86.898 57.753-87.884 0 1.002-57.755 86.914-57.738 87.884 0z"
		></path>
	</svg>
);

const DialogContainer = styled.div`
	text-align: center;
	width: 600px;
	padding: 65px 65px 0 65px;
`;

const DialogButton = styled( Button )`
	border-radius: 5px;
	width: 152px;
	--color-accent: #117ac9;
	--color-accent-60: #0e64a5;
	.gridicon {
		margin-left: 10px;
	}
`;

function SiteDeleteConfirmationDialog( {
	onClose,
	onConfirm,
	siteId,
}: {
	onClose: () => void;
	onConfirm: () => void;
	siteId: number;
} ) {
	const [ confirmText, setConfirmText ] = useState( '' );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, siteId ?? 0 ) );
	const siteTitle = useSelector( ( state ) => getSiteTitle( state ) );

	const translate = useTranslate();
	const deleteDisabled = confirmText.toUpperCase().replace( /\s/g, '' ) !== 'DELETE';

	return (
		<Dialog
			isBackdropVisible={ true }
			isVisible={ true }
			buttons={ [
				<DialogButton onClick={ onClose }>{ translate( 'Cancel' ) }</DialogButton>,
				<DialogButton primary disabled={ deleteDisabled } onClick={ onConfirm }>
					{ translate( 'Delete site content' ) }
				</DialogButton>,
			] }
			onClose={ onClose }
		>
			<DialogContainer>
				<ExclamationIcon />
				<FormattedHeader
					align="center"
					brandFont
					headerText={ translate( 'Site Reset Confirmation' ) }
					subHeaderText={ translate(
						'The current content of your website {{strong}}%(siteTitle)s{{/strong}} (%(siteAddress)s) will be deleted. ' +
							'This includes pages, posts, media, comments, third party plugins and themes. Any WordPress.com subscriptions ' +
							'on your site such as custom domains and emails will not be affected',
						{
							components: {
								strong: <strong />,
							},
							args: {
								siteTitle,
								siteAddress: siteDomain,
							},
						}
					) }
				/>
				<FormLabel htmlFor="confirmTextChangeInput">
					{ translate(
						'Type DELETE to confirm that your site’s current content will be deleted.'
					) }
				</FormLabel>

				<FormTextInput
					autoCapitalize="off"
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setConfirmText( event.target.value )
					}
					value={ confirmText }
					aria-required="true"
					id="confirmTextChangeInput"
				/>
			</DialogContainer>
		</Dialog>
	);
}

export default SiteDeleteConfirmationDialog;
