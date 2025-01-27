import { baseDomain, getTitleFromDescription, stripHtmlTags } from '../../../helpers';
import { blueskyTitle } from '../../helpers';
import { BlueskyPreviewProps } from '../../types';

import './styles.scss';

const BlueskyPostCard: React.FC< BlueskyPreviewProps > = ( { title, description, url, image } ) => {
	return (
		<div className="bluesky-preview__card">
			{ image ? (
				<div className="bluesky-preview__card-image">
					<img src={ image } alt="" />
				</div>
			) : null }
			<div className="bluesky-preview__card-text">
				<div className="bluesky-preview__card-site">{ baseDomain( url ) }</div>
				<div className="bluesky-preview__card-title">
					{ blueskyTitle( title ) || getTitleFromDescription( description ) }
				</div>
				<div className="bluesky-preview__card-description">{ stripHtmlTags( description ) }</div>
			</div>
		</div>
	);
};

export default BlueskyPostCard;
