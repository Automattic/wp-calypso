import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import SitePreviewLink from 'calypso/dashboard/components/site-preview-link';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useCreateSitePreviewLink } from './use-create-site-preview-link';
import { useDeleteSitePreviewLink } from './use-delete-site-preview-link';
import { useSitePreviewLinks } from './use-site-preview-links';
import type { SiteId } from 'calypso/types';

const InputPlaceholder = styled( LoadingPlaceholder )( {
	maxWidth: '100%',
	width: 120,
	height: 22,
	marginBottom: 12,
} );

const NOTICE_OPTIONS = {
	duration: 5000,
};

function useDispatchNotice() {
	const dispatch = useDispatch();

	return {
		showSuccessNotice: ( message: string ) => dispatch( successNotice( message, NOTICE_OPTIONS ) ),
		showErrorNotice: ( message: string ) => dispatch( errorNotice( message, NOTICE_OPTIONS ) ),
	};
}

interface SitePreviewLinksProps {
	siteId: SiteId;
	siteUrl: string;
	source: 'launch-settings' | 'privacy-settings' | 'smp-modal';
	disabled?: boolean;
	forceOff?: boolean;
}

export default function SitePreviewLinks( {
	siteId,
	siteUrl,
	disabled = false,
	forceOff = false,
	source,
}: SitePreviewLinksProps ) {
	const translate = useTranslate();
	const { showSuccessNotice, showErrorNotice } = useDispatchNotice();
	const [ checked, setChecked ] = useState( false );

	const { data: previewLinks, isLoading: isFirstLoading } = useSitePreviewLinks( {
		siteId,
		isEnabled: true,
	} );

	// Update toggle status if previewLinks have changed in another tab
	const validLinksLength = previewLinks?.filter( ( link ) => ! link.isRemoving ).length || 0;
	const shouldBeChecked = validLinksLength > 0;
	useEffect( () => {
		if ( shouldBeChecked !== checked ) {
			setChecked( shouldBeChecked );
		}
	}, [ checked, shouldBeChecked ] );

	const { createLink, isPending: isCreating } = useCreateSitePreviewLink( {
		siteId,
		onSuccess: () => {
			showSuccessNotice( translate( 'Preview link enabled.' ) );
			recordTracksEvent( 'calypso_site_preview_link_created', { source } );
		},
		onError: () => {
			showErrorNotice( translate( 'Unable to enable preview link.' ) );
			recordTracksEvent( 'calypso_site_preview_link_created_error', { source } );
		},
	} );

	const { deleteLink, isPending: isDeleting } = useDeleteSitePreviewLink( {
		siteId,
		onSuccess: () => {
			showSuccessNotice( translate( 'Preview link disabled.' ) );
			recordTracksEvent( 'calypso_site_preview_link_deleted', { source } );
		},
		onError: () => {
			showErrorNotice( translate( 'Unable to disable preview link.' ) );
			recordTracksEvent( 'calypso_site_preview_link_deleted_error', { source } );
		},
	} );

	function onChange( checkedValue: boolean ) {
		setChecked( checkedValue );
		if ( checkedValue ) {
			createLink();
		} else {
			previewLinks?.map( ( { code } ) => {
				deleteLink( code );
			} );
		}
	}

	const handleCopy = () => {
		showSuccessNotice( translate( 'Preview link copied to clipboard.' ) );
	};

	const checkedAndEnabled = checked && ! forceOff;
	const isBusy = isFirstLoading || isCreating || isDeleting;

	let description = translate(
		'"Coming soon" sites are only visible to you and invited users. Enable "Share site" to let collaborators without an account view your site.'
	);
	if ( 'privacy-settings' === source ) {
		description = translate(
			'Enable "Share site" to let collaborators without an account view your site.'
		);
	}

	return (
		<>
			<p>{ description }</p>
			{ isFirstLoading && <InputPlaceholder /> }
			{ ! isFirstLoading && (
				<>
					<ToggleControl
						label={ translate( 'Share site' ) }
						checked={ checkedAndEnabled }
						onChange={ onChange }
						{ ...{ disabled: disabled || isBusy } } // disabled is not included on ToggleControl props type
					/>
					{ ! forceOff &&
						previewLinks?.map( ( link ) => (
							<SitePreviewLink
								key={ link.code }
								{ ...link }
								label={ translate( 'preview link' ) }
								hideLabelFromVision
								disabled={ disabled || isBusy }
								siteUrl={ siteUrl }
								onCopy={ handleCopy }
							/>
						) ) }
				</>
			) }
		</>
	);
}
