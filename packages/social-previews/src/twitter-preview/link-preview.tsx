import { TwitterPostPreview } from './post-preview';
import { TwitterPreviewProps } from './types';

export const TwitterLinkPreview: React.FC< TwitterPreviewProps > = ( props ) => {
	return (
		<TwitterPostPreview
			{ ...props }
			// Override the props that are irrelevant to link preview
			text=""
			media={ undefined }
		/>
	);
};
