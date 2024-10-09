import { BlueskyPostPreview } from './post-preview';
import type { BlueskyPreviewProps } from './types';

export const BlueskyLinkPreview: React.FC< BlueskyPreviewProps > = ( props ) => {
	return <BlueskyPostPreview { ...props } user={ undefined } media={ undefined } customText="" />;
};
