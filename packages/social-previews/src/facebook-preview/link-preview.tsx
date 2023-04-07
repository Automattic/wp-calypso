import { useTranslate } from 'i18n-calypso';
import { baseDomain, facebookTitle, facebookDescription, facebookCustomText } from './helpers';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import FacebookPostIcon from './post/icons';
import type { FacebookPreviewProps } from './types';

const FacebookLinkPreview: React.FC< FacebookPreviewProps > = ( {
	url,
	title,
	description,
	image,
	user,
	customText,
} ) => {
	const translate = useTranslate();

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ user } />
			<div className="facebook-preview__content">
				{ customText && (
					<p className="facebook-preview__custom-text">{ facebookCustomText( customText ) }</p>
				) }
				<div className="facebook-preview__image">
					{ image && <img alt={ translate( 'Facebook Preview Thumbnail' ) } src={ image } /> }
				</div>
				<div className="facebook-preview__body">
					<div className="facebook-preview__url">{ baseDomain( url ) }</div>
					<div className="facebook-preview__title">{ facebookTitle( title ) }</div>
					<div className="facebook-preview__description">
						{ facebookDescription( description ) }
					</div>
					<div className="facebook-preview__info">
						<FacebookPostIcon name="info" />
					</div>
				</div>
			</div>
			<FacebookPostActions />
		</div>
	);
};

export default FacebookLinkPreview;
