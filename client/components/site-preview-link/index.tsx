import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import ClipboardButtonInput from '../clipboard-button-input';
import { useCreateSitePreviewLink } from './use-create-site-preview-link';
import { useDeleteSitePreviewLink } from './use-delete-site-preview-link';
import { useSitePreviewLinks } from './use-site-preview-links';
import type { SiteId } from 'calypso/types';

interface SitePreviewLinkProps {
	siteId: SiteId;
	siteUrl: string;
	source: 'launch-settings' | 'privacy-settings' | 'smp-modal';
	disabled?: boolean;
}

const HelpText = styled.p( {
	display: 'block',
	margin: '5px 0',
	fontSize: '0.875rem',
	fontStyle: 'italic',
	fontWeight: 400,
	color: 'var(--color-text-subtle)',
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

export default function SitePreviewLink( {
	siteId,
	siteUrl,
	disabled = false,
	source,
}: SitePreviewLinkProps ) {
	const translate = useTranslate();
	const { showSuccessNotice, showErrorNotice } = useDispatchNotice();
	const [ checked, setChecked ] = useState( false );

	const { data: previewLinks, isLoading: isFirstLoading } = useSitePreviewLinks( {
		siteId,
		onSuccess: ( linksResponse ) => {
			const validLinksLength = linksResponse?.filter( ( link ) => ! link.isRemoving ).length || 0;
			setChecked( validLinksLength > 0 );
		},
	} );

	const { createLink, isLoading: isCreating } = useCreateSitePreviewLink( {
		siteId,
		onSuccess: () => {
			showSuccessNotice( translate( 'Preview link created successfully!' ) );
			recordTracksEvent( 'calypso_site_preview_link_created', { source } );
		},
		onError: () => {
			showErrorNotice( translate( 'Error creating the preview link.' ) );
			recordTracksEvent( 'calypso_site_preview_link_created_error', { source } );
		},
	} );

	const { deleteLink, isLoading: isDeleting } = useDeleteSitePreviewLink( {
		siteId,
		onSuccess: () => {
			showSuccessNotice( translate( 'Preview link removed successfully!' ) );
			recordTracksEvent( 'calypso_site_preview_link_deleted', { source } );
		},
		onError: () => {
			showErrorNotice( translate( 'Error removing the preview link.' ) );
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

	const checkedAndEnabled = checked && ! disabled;
	const isBusy = isFirstLoading || isCreating || isDeleting;

	if ( isFirstLoading ) {
		return <Spinner />;
	}
	return (
		<div>
			<ToggleControl
				label={ translate( 'Create a preview link.' ) }
				checked={ checkedAndEnabled }
				onChange={ onChange }
				{ ...{ disabled: disabled || isBusy } } // disabled is not included on ToggleControl props type
			/>
			<HelpText>{ translate( 'Anyone with this link can view your site.' ) }</HelpText>
			{ ! disabled &&
				previewLinks?.map( ( { code, isCreating = false, isRemoving = false } ) => {
					let linkValue = `${ siteUrl }?share=${ code }`;
					if ( isCreating ) {
						linkValue = translate( 'Loading…' );
					} else if ( isRemoving ) {
						linkValue = translate( 'Removing…' );
					}
					return <ClipboardButtonInput key={ code } value={ linkValue } disabled={ isBusy } />;
				} ) }
		</div>
	);
}
