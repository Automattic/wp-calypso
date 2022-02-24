import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import placeholder from 'calypso/assets/images/difm/placeholder.svg';
import FilePicker from 'calypso/components/file-picker';
import Spinner from 'calypso/components/spinner';
import { useAddMedia } from 'calypso/data/media/use-add-media';
import { Label, SubLabel } from 'calypso/signup/accordion-form/form-components';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

const debug = debugFactory( 'difm:website-content' );

const UPLOAD_STATES = {
	NOT_SELECTED: 'NOT_SELECTED',
	IN_PROGRESS: 'IN_PROGRESS',
	COMPLETED: 'COMPLETED',
	FAILED: 'FAILED',
};

const FileSelectThumbnailContainer = styled.div< { disabled?: boolean } >`
	cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	width: 195px;
	height: 145px;
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
	img {
		max-height: 100%;
		max-width: 100%;
		margin: 0 auto;
	}
`;

export interface MediaUploadData {
	title?: string;
	URL?: string;
	uploadID?: string;
	mediaIndex: number;
}
interface WordpressMediaUploadProps {
	onMediaUploadComplete: ( imageData: MediaUploadData ) => void;
	onMediaUploadStart?: ( imageData: MediaUploadData ) => void;
	onMediaUploadFailed?: ( imageData: MediaUploadData ) => void;
	mediaIndex: number;
	site: SiteData;
	initialUrl: string;
	initialCaption: string;
}

export function WordpressMediaUpload( {
	mediaIndex,
	site,
	onMediaUploadComplete,
	onMediaUploadStart,
	onMediaUploadFailed,
	initialUrl,
	initialCaption,
}: WordpressMediaUploadProps ) {
	const [ uploadedImageUrl, setUploadedImageUrl ] = useState( initialUrl );
	const [ uploadState, setUploadState ] = useState(
		initialUrl ? UPLOAD_STATES.COMPLETED : UPLOAD_STATES.NOT_SELECTED
	);
	const [ imageCaption, setImageCaption ] = useState( initialCaption );
	const translate = useTranslate();
	const addMedia = useAddMedia();
	const onPick = async function ( file: FileList ) {
		setImageCaption( '' );
		onMediaUploadStart && onMediaUploadStart( { mediaIndex } );
		setUploadState( UPLOAD_STATES.IN_PROGRESS );
		try {
			const [ { title, URL, ID } ] = await addMedia( file, site );
			setUploadedImageUrl( URL );
			setImageCaption( title );
			onMediaUploadComplete( { title, URL, uploadID: ID, mediaIndex } );
			setUploadState( UPLOAD_STATES.COMPLETED );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch ( e: any ) {
			setUploadState( UPLOAD_STATES.FAILED );
			onMediaUploadFailed && onMediaUploadFailed( { mediaIndex } );
			debug( 'Image upload failed' );
			debug( e.message );
		}
	};

	switch ( uploadState ) {
		case UPLOAD_STATES.COMPLETED:
			return (
				<FilePicker key={ mediaIndex } accept="image/*" onPick={ onPick }>
					<FileSelectThumbnailContainer>
						<CroppedImage>
							<img src={ uploadedImageUrl } alt={ imageCaption } />
						</CroppedImage>
						<Label>{ translate( 'Replace' ) }</Label>
					</FileSelectThumbnailContainer>
				</FilePicker>
			);
		case UPLOAD_STATES.IN_PROGRESS:
			return (
				<FileSelectThumbnailContainer key={ mediaIndex } disabled={ true }>
					<Spinner />
				</FileSelectThumbnailContainer>
			);
		case UPLOAD_STATES.FAILED:
			return (
				<FilePicker accept="image/*" onPick={ onPick } key={ mediaIndex }>
					<FileSelectThumbnailContainer>
						<img src={ placeholder } alt="placeholder" />
						<Label>{ translate( 'Choose file' ) }</Label>
						<SubLabel color="red">{ translate( 'Image upload failed' ) }</SubLabel>
					</FileSelectThumbnailContainer>
				</FilePicker>
			);

		case UPLOAD_STATES.NOT_SELECTED:
		default:
			return (
				<FilePicker accept="image/*" onPick={ onPick } key={ mediaIndex }>
					<FileSelectThumbnailContainer>
						<img src={ placeholder } alt="placeholder" />
						<Label>{ translate( 'Choose file' ) }</Label>
						{ /* <SubLabel>{ translate( 'or drag here')}</SubLabel> */ }
					</FileSelectThumbnailContainer>
				</FilePicker>
			);
	}
}
