import { preparePreviewText } from '../helpers';
import { Card } from './card';
import { Footer } from './footer';
import { Header } from './header';
import { CAPTION_MAX_CHARS } from './helpers';
import { Media } from './media';
import { Sidebar } from './sidebar';
import { ThreadsPreviewProps } from './types';

import './style.scss';

export const ThreadsPostPreview: React.FC< ThreadsPreviewProps > = ( {
	caption,
	date,
	image,
	media,
	name,
	profileImage,
	showThreadConnector,
	title,
	url,
} ) => {
	const hasMedia = !! media?.length;

	const displayAsCard = url && image && ! hasMedia;

	return (
		<div className="threads-preview__wrapper">
			<div className="threads-preview__container">
				<Sidebar profileImage={ profileImage } showThreadConnector={ showThreadConnector } />
				<div className="threads-preview__main">
					<Header name={ name } date={ date } />
					<div className="threads-preview__content">
						{ caption ? (
							<div className="threads-preview__text">
								{ preparePreviewText( caption, {
									platform: 'threads',
									maxChars: CAPTION_MAX_CHARS,
								} ) }
							</div>
						) : null }
						{ hasMedia ? <Media media={ media } /> : null }
						{ displayAsCard ? <Card image={ image } title={ title || '' } url={ url } /> : null }
					</div>
					<Footer />
				</div>
			</div>
		</div>
	);
};
