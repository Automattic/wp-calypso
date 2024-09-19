import { getTitleFromDescription } from '../helpers';
import { LinkedInPostPreview } from './post-preview';
import { LinkedInPreviewProps } from './types';

type OptionalProps = Partial< Pick< LinkedInPreviewProps, 'name' | 'profileImage' > >;

export type LinkedInLinkPreviewProps = Omit< LinkedInPreviewProps, keyof OptionalProps > &
	OptionalProps;

export function LinkedInLinkPreview( props: LinkedInLinkPreviewProps ) {
	return (
		<LinkedInPostPreview
			name=""
			profileImage=""
			{ ...props }
			// Override the props that are irrelevant to link preview
			description=""
			media={ undefined }
			title={ props.title || getTitleFromDescription( props.description ) }
		/>
	);
}
