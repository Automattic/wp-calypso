import { preparePreviewText } from '../helpers';
import { Card } from './card';
import { Footer } from './footer';
import { Header } from './header';
import { Media } from './media';
import { Sidebar } from './sidebar';
import { ThreadsPreviewProps } from './types';

import './style.scss';

export const ThreadsPostPreview: React.FC< ThreadsPreviewProps > = ( {
	date,
	description,
	image,
	media,
	name,
	profileImage,
	showThreadConnector,
	text,
	title,
	url,
} ) => {
	const hasMedia = !! media?.length;

	const displayAsCard = url && image && ! hasMedia;

	let textToDisplay = text || title;

	// Attach the URL to the text if not displaying as a card and it's not already in the text.
	textToDisplay =
		! displayAsCard && textToDisplay && url && ! textToDisplay.includes( url )
			? `${ textToDisplay } ${ url }`
			: textToDisplay;

	return (
		<div className="threads-preview__wrapper">
			<div className="threads-preview__container">
				<Sidebar profileImage={ profileImage } showThreadConnector={ showThreadConnector } />
				<div className="threads-preview__main">
					<Header name={ name } date={ date } />
					<div className="threads-preview__content">
						{ textToDisplay ? (
							<div className="threads-preview__text">
								{ preparePreviewText( textToDisplay, { platform: 'threads' } ) }
							</div>
						) : null }
						{ hasMedia ? <Media media={ media } /> : null }
						{ displayAsCard ? (
							<Card
								description={ description || '' }
								image={ image }
								title={ title || '' }
								url={ url }
							/>
						) : null }
					</div>
					<Footer />
				</div>
			</div>
		</div>
	);
};
