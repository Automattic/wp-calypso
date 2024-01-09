import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { trailingslashit } from 'calypso/lib/route';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import ClipboardButtonInput from '../clipboard-button-input';
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

interface SitePreviewLinkProps {
	siteId: SiteId;
	siteUrl: string;
	source: 'launch-settings' | 'privacy-settings' | 'smp-modal';
	disabled?: boolean;
	forceOff?: boolean;
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
	forceOff = false,
	source,
}: SitePreviewLinkProps ) {
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
		<div>
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
						previewLinks?.map( ( { code, isCreating = false, isRemoving = false } ) => {
							let linkValue = `${ trailingslashit( siteUrl ) }?share=${ code }`;
							if ( isCreating ) {
								linkValue = translate( 'Loading…' );
							} else if ( isRemoving ) {
								linkValue = translate( 'Disabling…' );
							}
							return (
								<ClipboardButtonInput
									key={ code }
									value={ linkValue }
									disabled={ isBusy || disabled }
								/>
							);
						} ) }
					{ checkedAndEnabled && (
						<HelpText>{ translate( 'Anyone with the link can view your site.' ) }</HelpText>
					) }
				</>
			) }
		</div>
	);
}
