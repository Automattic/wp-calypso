import FacebookLinkPreview from './link-preview';
import type { FacebookPreviewProps } from './types';

const DefaultFacebookLinkPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	return <FacebookLinkPreview { ...props } compactDescription customText="" user={ undefined } />;
};

export default DefaultFacebookLinkPreview;
