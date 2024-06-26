import { ThreadsPostPreview } from './post-preview';
import { ThreadsPreviewProps } from './types';

export const ThreadsLinkPreview: React.FC< ThreadsPreviewProps > = ( props ) => {
	return (
		<ThreadsPostPreview
			{ ...props }
			// Override the props that are irrelevant to link preview
			text=""
			media={ undefined }
		/>
	);
};
