import {
	firstValid,
	hardTruncation,
	shortEnough,
	truncatedAtSpace,
	stripHtmlTags,
	baseDomain,
} from '../helpers';
import { SocialPreviewBaseProps } from '../types';

import './style.scss';

const URL_LENGTH = 68;
const TITLE_LENGTH = 63;
const DESCRIPTION_LENGTH = 160;

const googleUrl = ( url: string ) => {
	const protocol = url.startsWith( 'https://' ) ? 'https://' : 'http://';

	const breadcrumb = protocol + url.replace( protocol, '' ).split( '/' ).join( ' › ' );

	const truncateBreadcrumb = firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) );

	return truncateBreadcrumb( breadcrumb );
};

const googleTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	truncatedAtSpace( TITLE_LENGTH - 40, TITLE_LENGTH + 10 ),
	hardTruncation( TITLE_LENGTH )
);

const googleDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	truncatedAtSpace( DESCRIPTION_LENGTH - 80, DESCRIPTION_LENGTH + 10 ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export type GoogleSearchPreviewProps = Omit< SocialPreviewBaseProps, 'image' > & {
	siteTitle?: string;
};

export const GoogleSearchPreview: React.FC< GoogleSearchPreviewProps > = ( {
	description = '',
	siteTitle,
	title = '',
	url = '',
} ) => {
	const domain = baseDomain( url );

	return (
		<div className="search-preview">
			<div className="search-preview__display">
				<div className="search-preview__header">
					<div className="search-preview__branding">
						<img
							className="search-preview__icon"
							src={ `https://www.google.com/s2/favicons?sz=128&domain_url=${ domain }` }
							alt=""
						/>
						<div className="search-preview__site">
							<div className="search-preview__site--title">{ siteTitle || domain }</div>
							<div className="search-preview__url">{ googleUrl( url ) }</div>
						</div>
					</div>
					<div className="search-preview__menu">
						<svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
						</svg>
					</div>
				</div>
				<div className="search-preview__title">{ googleTitle( title ) }</div>
				<div className="search-preview__description">
					{ googleDescription( stripHtmlTags( description ) ) }
				</div>
			</div>
		</div>
	);
};
