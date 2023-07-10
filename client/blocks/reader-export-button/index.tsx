import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { saveAs } from 'browser-filesaver';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef, useCallback, ComponentProps } from 'react';
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

// Note: there is a type issue where `disabled` can't be used if we accept every single
// button prop. As a result, we can pick the props we want to allow.
type AcceptedButtonProps = Pick<
	ComponentProps< typeof Button >,
	'icon' | 'iconSize' | 'variant' | 'disabled'
>;

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
					? await wp.req.get( `/read/lists/${ listId }/export`, {
							apiNamespace: 'wpcom/v2',
					  } )
					: await wp.req.get( `/read/following/mine/export`, { apiVersion: '1.2' } );
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
			{ ...props }
		>
			{ ! props.icon && <Gridicon icon="cloud-download" className="reader-export-button__icon" /> }
			<span className="reader-export-button__label">{ translate( 'Export' ) }</span>
		</Button>
	);
};

export default ReaderExportButton;
