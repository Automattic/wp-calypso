import { Button } from '@wordpress/components';
import { download } from '@wordpress/icons';
import { saveAs } from 'browser-filesaver';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef, useCallback, ComponentPropsWithoutRef } from 'react';
import {
	READER_EXPORT_TYPE_SUBSCRIPTIONS,
	READER_EXPORT_TYPE_LIST,
} from 'calypso/blocks/reader-export-button/constants';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';

import './style.scss';

type ExportType = typeof READER_EXPORT_TYPE_SUBSCRIPTIONS | typeof READER_EXPORT_TYPE_LIST;

type ExportResponse = {
	success: boolean;
	opml: string;
};

type ReaderExportButtonProps = {
	exportType?: ExportType;
	filename?: string;
	listId?: number;
};

// Note: since the Button must be disableable, it must not be a link. So we need to remove the link type variant from the accepted props.
type RemoveAnchorButtonProps< T > = T extends { href: string } ? never : T;
type AcceptedButtonProps = RemoveAnchorButtonProps< ComponentPropsWithoutRef< typeof Button > >;

const ReaderExportButton = ( {
	filename = 'reader-export.opml',
	exportType = READER_EXPORT_TYPE_SUBSCRIPTIONS,
	disabled,
	listId,
	...props
}: ReaderExportButtonProps & AcceptedButtonProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMounted = useRef( false );
	const [ isExportInProgress, setExportInProgress ] = useState< boolean >( false );

	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

	const onClick = useCallback( async () => {
		if ( disabled || isExportInProgress ) {
			return;
		}

		setExportInProgress( true );

		const showErrorNotice = () => {
			dispatch(
				errorNotice( translate( 'Sorry, there was a problem creating your export file.' ) )
			);
		};

		const onApiResponse = ( data?: ExportResponse ) => {
			if ( ! data?.success ) {
				showErrorNotice();
				return;
			}

			const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
			saveAs( blob, filename );

			if ( isMounted.current ) {
				setExportInProgress( false );
			}
		};

		try {
			const data =
				exportType === READER_EXPORT_TYPE_LIST
					? await wp.req.get( `/read/lists/${ listId }/export`, { apiNamespace: 'wpcom/v2' } )
					: await wp.req.get( '/read/following/mine/export', { apiVersion: '1.2' } );
			onApiResponse( data );
		} catch ( error ) {
			showErrorNotice();
		}
	}, [ disabled, isExportInProgress, dispatch, translate, filename, exportType, listId ] );

	return (
		<Button
			className="reader-export-button"
			disabled={ disabled || isExportInProgress }
			onClick={ onClick }
			icon={ download }
			text={ translate( 'Export OPML' ) }
			{ ...props }
		/>
	);
};

export default ReaderExportButton;
