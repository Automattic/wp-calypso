import { Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
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

export default function SitePreviewLink( {
	siteId,
	siteUrl,
	disabled = false,
}: SitePreviewLinkProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: previewLinks, isLoading: isFirstLoading } = useSitePreviewLinks( siteId );
	const { createLink, isLoading: isCreating } = useCreateSitePreviewLink(
		siteId,
		() => {
			dispatch(
				successNotice( translate( 'Preview link created successfully!' ), NOTICE_OPTIONS )
			);
			// TODO: add tracks event
		},
		() => {
			dispatch( errorNotice( translate( 'Error creating the preview link.' ), NOTICE_OPTIONS ) );
			// TODO: add tracks event
		}
	);
	const { deleteLink, isLoading: isDeleting } = useDeleteSitePreviewLink(
		siteId,
		() => {
			dispatch(
				successNotice( translate( 'Preview link removed successfully!' ), NOTICE_OPTIONS )
			);
			// TODO: add tracks event
		},
		() => {
			dispatch( errorNotice( translate( 'Error removing the preview link.' ), NOTICE_OPTIONS ) );
			// TODO: add tracks event
		}
	);
	const [ checked, setChecked ] = useState( false );

	const previewLinkNotRemoving = previewLinks?.filter( ( link ) => ! link.isRemoving );
	useEffect( () => {
		const hasLinks = Boolean( previewLinkNotRemoving && previewLinkNotRemoving?.length > 0 );
		setChecked( hasLinks );
	}, [ previewLinkNotRemoving ] );

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
					let linkValue = `${ siteUrl }?preview=${ code }`;
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
