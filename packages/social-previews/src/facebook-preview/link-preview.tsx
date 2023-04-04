import { compact } from 'lodash';
import { firstValid, hardTruncation, shortEnough, stripHtmlTags } from '../helpers';
import type { FacebookPreviewProps } from './types';

const TITLE_LENGTH = 80;
const DESCRIPTION_LENGTH = 200;

const baseDomain = ( url: string ): string =>
	url &&
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

const facebookTitle = firstValid( shortEnough( TITLE_LENGTH ), hardTruncation( TITLE_LENGTH ) );

const facebookDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

const FacebookLinkPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	const { url, title, description, image, author } = props;

	return (
		<div className="facebook-preview">
			<div className="facebook-preview__content">
				<div className="facebook-preview__image">
					{ image && <img alt="Facebook Preview Thumbnail" src={ image } /> }
				</div>
				<div className="facebook-preview__body">
					<div className="facebook-preview__url">
						{ compact( [ baseDomain( url ), author ] ).join( ' | ' ) }
					</div>
					<div className="facebook-preview__title">{ facebookTitle( title || '' ) }</div>
					<div className="facebook-preview__description">
						{ facebookDescription( stripHtmlTags( description ) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default FacebookLinkPreview;
