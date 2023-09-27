import { ReactElement } from 'react';
import Theme from 'calypso/components/theme';
import './style.scss';

interface ThemeCollectionProps {
	heading: string;
	themes: Array< never >;
	collectionSlug: string;
	onScreenshotCLick: () => void;
	onStyleVariationClick: () => void;
	onMoreButtonClick: () => void;
	onMoreButtonItemClick: () => void;
	getScreenshotUrl: ( themeId: string ) => string;
	siteId: string;
}

export default function ThemeCollection( {
	collectionSlug,
	heading,
	themes,
	onScreenshotCLick,
	onStyleVariationClick,
	getScreenshotUrl,
	onMoreButtonClick,
	onMoreButtonItemClick,
	siteId,
}: ThemeCollectionProps ): ReactElement {
	return (
		<div className="theme-collection__container">
			<h2>{ heading }</h2>
			{ themes.map( ( theme, index ) => (
				<div>
					<Theme
						onScreenshotCLick={ onScreenshotCLick }
						onStyleVariationClick={ onStyleVariationClick }
						onMoreButtonClick={ onMoreButtonClick }
						getScreenshotUrl={ getScreenshotUrl }
						onMoreButtonItemClick={ onMoreButtonItemClick }
						key={ `theme-collection-${ collectionSlug }-${ index }` }
						theme={ theme }
						siteId={ siteId }
					/>
				</div>
			) ) }
		</div>
	);
}
