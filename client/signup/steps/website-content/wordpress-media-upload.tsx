import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import placeholder from 'calypso/assets/images/difm/placeholder.svg';
import FilePicker from 'calypso/components/file-picker';
import Spinner from 'calypso/components/spinner';
import { useAddMedia } from 'calypso/data/media/use-add-media';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { Label, SubLabel } from './components';

const debug = debugFactory( 'difm:website-content' );

const UPLOAD_STATES = {
	NOT_SELECTED: 'NOT_SELECTED',
	IN_PROGRESS: 'IN_PROGRESS',
	COMPLETED: 'COMPLETED',
	FAILED: 'FAILED',
};

const FileSelectThumbnailContainer = styled.div`
	min-width: 190px;
	width: 190px;
	max-height: 145px;
	min-height: 93px;
	background: rgba( 187, 224, 250, 0.12 );
	border: 1px dashed var( --studio-gray-5 );
	border-radius: 5px;
	text-align: center;
	padding: 26px 5px;
`;

const CroppedImage = styled.div`
	overflow: hidden;
	height: 80%;
	text-align: center;
	img {
		margin: 0 auto;
	}
`;

const Preview = styled.div`
	width: 140px;
	height: 43px;
	margin: 0 auto;
`;

interface WordpressMediaUploadProps {
	onMediaUploaded: ( { title, URL, ID }: { title: string; URL: string; ID: string } ) => void;
	mediaId: number;
	site: SiteData;
}

export function WordpressMediaUpload( {
	mediaId,
	site,
	onMediaUploaded,
}: WordpressMediaUploadProps ) {
	const [ uploadState, setUploadState ] = useState( UPLOAD_STATES.NOT_SELECTED );
	const [ uploadedImageUrl, setUploadedImageUrl ] = useState( '' );
	const [ imageCaption, setImageCaption ] = useState( '' );
	const translate = useTranslate();
	const addMedia = useAddMedia();
	const onPick = async function ( file: FileList ) {
		setImageCaption( '' );
		setUploadState( UPLOAD_STATES.IN_PROGRESS );
		try {
			const [ { title, URL, ID } ] = await addMedia( file, site );
			setUploadedImageUrl( URL );
			setImageCaption( title );
			onMediaUploaded( { title, URL, ID } );
			setUploadState( UPLOAD_STATES.COMPLETED );
		} catch ( e: any ) {
			setUploadState( UPLOAD_STATES.FAILED );
			debug( 'Image upload failed' );
			debug( e.message );
		}
	};

	switch ( uploadState ) {
		case UPLOAD_STATES.COMPLETED:
			return (
				<FilePicker key={ mediaId } accept="image/*" onPick={ onPick }>
					<FileSelectThumbnailContainer>
						<div>
							<Preview>
								<CroppedImage>
									<img src={ uploadedImageUrl } alt={ imageCaption } />
								</CroppedImage>
							</Preview>
							<Label>{ translate( 'Change File' ) }</Label>
							<SubLabel>{ imageCaption }</SubLabel>
						</div>
					</FileSelectThumbnailContainer>
				</FilePicker>
			);
		case UPLOAD_STATES.IN_PROGRESS:
			return (
				<FileSelectThumbnailContainer key={ mediaId }>
					<div>
						<Preview>
							<Spinner />
						</Preview>
					</div>
				</FileSelectThumbnailContainer>
			);
		case UPLOAD_STATES.FAILED:
			return (
				<FilePicker accept="image/*" onPick={ onPick } key={ mediaId }>
					<FileSelectThumbnailContainer>
						<div>
							<Preview>
								<img src={ placeholder } alt="placeholder" />
							</Preview>
							<Label>{ translate( 'Choose file' ) }</Label>
							<SubLabel color="red">{ translate( 'Image upload failed' ) }</SubLabel>
						</div>
					</FileSelectThumbnailContainer>
				</FilePicker>
			);

		case UPLOAD_STATES.NOT_SELECTED:
		default:
			return (
				<FilePicker accept="image/*" onPick={ onPick } key={ mediaId }>
					<FileSelectThumbnailContainer>
						<div>
							<Preview>
								<img src={ placeholder } alt="placeholder" />
							</Preview>
							<div
								className="wordpress-media-upload__temporary-spacer"
								style={ { width: '100px', height: '22px' } }
							/>
							<Label>{ translate( 'Choose file' ) }</Label>
							{ /* <SubLabel>{ translate( 'or drag here')}</SubLabel> */ }
						</div>
					</FileSelectThumbnailContainer>
				</FilePicker>
			);
	}
}
