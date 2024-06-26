import config from '@automattic/calypso-config';
import { Gridicon, Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { useAddMedia } from 'calypso/data/media/use-add-media';
import { logToLogstash } from 'calypso/lib/logstash';
import { LabelLink, SubLabel } from 'calypso/signup/accordion-form/form-components';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { Media, MediaUploadType } from 'calypso/state/signup/steps/website-content/types';
import type { SiteDetails } from '@automattic/data-stores';

const debug = debugFactory( 'difm:website-content' );
const allowedImageExtensions = [ 'gif', 'heic', 'jpeg', 'jpg', 'png', 'webp' ];
const allowedVideoExtensions = [ 'avi', 'mpg', 'mp4', 'm4v', 'mov', 'ogv', 'wmv', '3gp', '3g2' ];

const UPLOAD_STATES = {
	NOT_SELECTED: 'NOT_SELECTED',
	IN_PROGRESS: 'IN_PROGRESS',
	COMPLETED: 'COMPLETED',
	FAILED: 'FAILED',
};

const MediaPlaceholderIcon = styled( Gridicon )`
	color: #e9eff6;
	width: 45px;
	height: 45px;
`;

const MediaPlaceholder = ( { mediaType }: { mediaType: MediaUploadType } ) => {
	switch ( mediaType ) {
		case 'IMAGE':
			return <MediaPlaceholderIcon icon="image" />;
		case 'VIDEO':
			return <MediaPlaceholderIcon icon="video" />;
		case 'IMAGE-AND-VIDEO':
			return <MediaPlaceholderIcon icon="attachment" />;
	}
};

const StyledGridIcon = styled( Gridicon )`
	z-index: 101;
	position: absolute;
	top: 5px;
	right: 5px;
	color: var( --studio-gray-20 );
	cursor: pointer;
	background-color: #f5f9fc;
	border-radius: 13px;
	width: 15px;
	height: 15px;
	border: 2px solid var( --studio-gray-20 );
	&:hover {
		color: var( --studio-gray-80 );
		border: 2px solid var( --studio-gray-80 );
	}
`;

const FileInput = styled.input`
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 100;
	opacity: 0;
	cursor: pointer;
`;

const FileSelectThumbnailContainer = styled.div< { disabled?: boolean } >`
	cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	position: relative;
	width: 140px;
	height: 98px;
	background: rgba( 187, 224, 250, 0.12 );
	border: 1px dashed var( --studio-gray-5 );
	border-radius: 5px;
	text-align: center;
	padding: 26px 5px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	.form-label {
		text-decoration: underline;
		font-weight: bold;
		margin-bottom: 0;
	}
`;

const CroppedImage = styled.div`
	overflow: hidden;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	position: relative;
	min-width: 140px;
	img {
		max-height: 100%;
		max-width: 100%;
		margin: 0 auto;
	}
`;
const CroppedLabel = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 90%;
	height: 45px;
`;

function CrossButton( { onClick }: { onClick: ( e: MouseEvent< SVGSVGElement > ) => void } ) {
	const onIconClick = ( e: MouseEvent< SVGSVGElement > ) => {
		e.stopPropagation();
		onClick( e );
	};

	return <StyledGridIcon icon="cross" onClick={ onIconClick } />;
}

export interface MediaUploadData {
	title?: string;
	URL?: string;
	uploadID?: string;
	mediaIndex: number;
	thumbnailUrl?: string;
}
interface WordpressMediaUploadProps {
	onMediaUploadComplete: ( imageData: MediaUploadData ) => void;
	onMediaUploadStart?: ( imageData: MediaUploadData ) => void;
	onMediaUploadFailed?: ( imageData: MediaUploadData ) => void;
	onRemoveImage: ( imageData: MediaUploadData ) => void;
	mediaIndex: number;
	site?: SiteDetails | null;
	media?: Media;
}

function getAllowedFileTypes( mediaType: MediaUploadType ) {
	switch ( mediaType ) {
		case 'IMAGE':
			return allowedImageExtensions;
		case 'VIDEO':
			return allowedVideoExtensions;
		case 'IMAGE-AND-VIDEO':
			return allowedImageExtensions.concat( allowedVideoExtensions );
		default:
			return [];
	}
}

export function WordpressMediaUpload( {
	mediaIndex,
	site,
	onMediaUploadComplete,
	onMediaUploadStart,
	onMediaUploadFailed,
	onRemoveImage,
	media = { caption: '', url: '', mediaType: 'IMAGE', thumbnailUrl: '', uploadID: '' },
}: WordpressMediaUploadProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const addMedia = useAddMedia();
	const { url, caption, mediaType, thumbnailUrl } = media ?? {};
	const [ uploadState, setUploadState ] = useState(
		url ? UPLOAD_STATES.COMPLETED : UPLOAD_STATES.NOT_SELECTED
	);
	const [ imageCaption, setImageCaption ] = useState( caption );
	const [ isImageLoading, setIsImageLoading ] = useState( false );

	const allowedFileTypes = getAllowedFileTypes( mediaType );
	const allowedFileTypesString = allowedFileTypes.map( ( type ) => `.${ type }` ).join();

	// Initialize uploadState if media has already been uploaded.
	useEffect( () => {
		if ( url?.length ) {
			setUploadState( UPLOAD_STATES.COMPLETED );
		}
	}, [ url ] );

	const isFileValid = ( fileList: FileList | null ): boolean => {
		if ( ! fileList ) {
			return false;
		}
		const [ file ] = Array.from( fileList );
		const { name: fileName = '' } = file;

		const fileParts = fileName.split( '.' );
		const extension = fileParts[ fileParts.length - 1 ];

		if ( allowedFileTypes.includes( extension?.toLowerCase() ) ) {
			return true;
		}
		return false;
	};

	const onPick = async function ( event: ChangeEvent< HTMLInputElement > ) {
		const fileList = event.target.files;
		if ( ! isFileValid( fileList ) ) {
			dispatch(
				errorNotice( translate( 'This type of file is not allowed for this section' ), {
					id: 'INVALID_FILE_NOTICE',
				} )
			);
			return;
		}
		setIsImageLoading( true );
		setImageCaption( '' );
		onMediaUploadStart && onMediaUploadStart( { mediaIndex } );
		setUploadState( UPLOAD_STATES.IN_PROGRESS );

		try {
			const [ media ] = await addMedia( fileList, site );
			const { title, URL, ID, thumbnails, icon } = media;
			setImageCaption( title );
			onMediaUploadComplete( {
				title,
				URL,
				uploadID: ID,
				mediaIndex,
				thumbnailUrl: thumbnails.thumbnail ?? icon,
			} );
			setUploadState( UPLOAD_STATES.COMPLETED );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch ( e: any ) {
			setUploadState( UPLOAD_STATES.FAILED );
			onMediaUploadFailed && onMediaUploadFailed( { mediaIndex } );
			debug( 'Image upload failed' );
			debug( e.message );
			logToLogstash( {
				feature: 'calypso_client',
				message: 'BBEX: Image upload failed',
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				blog_id: site?.ID,
				extra: {
					filename: fileList?.item( 0 )?.name,
					filesize: fileList?.item( 0 )?.size,
					'files-picked': fileList?.length,
					'error-message': e.message + '; Stack: ' + e.stack,
				},
			} );
		}
	};

	const onClickRemoveImage = () => {
		setUploadState( UPLOAD_STATES.NOT_SELECTED );
		setImageCaption( '' );
		onRemoveImage && onRemoveImage( { mediaIndex } );
	};

	switch ( uploadState ) {
		case UPLOAD_STATES.COMPLETED:
			return (
				<>
					<FileSelectThumbnailContainer>
						<FileInput type="file" onChange={ onPick } accept={ allowedFileTypesString } />
						{ /* Fixes small UI glitch where cross icon switches on load */ }
						{ ! isImageLoading && <CrossButton onClick={ onClickRemoveImage } /> }
						<CroppedImage>
							<img
								style={ { opacity: isImageLoading ? 0.2 : 1 } }
								src={ thumbnailUrl ?? url }
								alt={ imageCaption }
								onLoad={ () => setIsImageLoading( false ) }
							/>
						</CroppedImage>
						{ mediaType === 'VIDEO' && <CroppedLabel>{ caption }</CroppedLabel> }
						<LabelLink>{ translate( 'Replace' ) }</LabelLink>
					</FileSelectThumbnailContainer>
				</>
			);
		case UPLOAD_STATES.IN_PROGRESS:
			return (
				<FileSelectThumbnailContainer key={ mediaIndex } disabled>
					<Spinner />
				</FileSelectThumbnailContainer>
			);
		case UPLOAD_STATES.FAILED:
			return (
				<>
					<FileSelectThumbnailContainer>
						<FileInput type="file" onChange={ onPick } accept={ allowedFileTypesString } />
						<MediaPlaceholder mediaType={ mediaType } />
						<LabelLink>{ translate( 'Choose file' ) }</LabelLink>
						<SubLabel color="red">{ translate( 'Image upload failed' ) }</SubLabel>
					</FileSelectThumbnailContainer>
				</>
			);

		case UPLOAD_STATES.NOT_SELECTED:
		default:
			return (
				<>
					<FileSelectThumbnailContainer>
						<FileInput type="file" onChange={ onPick } accept={ allowedFileTypesString } />
						<MediaPlaceholder mediaType={ mediaType } />
						<LabelLink>{ translate( 'Choose file' ) }</LabelLink>
						{ /* <SubLabel>{ translate( 'or drag here')}</SubLabel> */ }
					</FileSelectThumbnailContainer>
				</>
			);
	}
}
