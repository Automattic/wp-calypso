import TumblrLinkPreview from './link-preview';
import type { TumblrPreviewProps } from './types';

const TumblrDefaultLinkPreview: React.FC< TumblrPreviewProps > = ( props ) => (
	<TumblrLinkPreview { ...props } readOnly />
);

export default TumblrDefaultLinkPreview;
