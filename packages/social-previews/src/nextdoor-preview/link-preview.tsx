import { getTitleFromDescription } from '../helpers';
import { NextdoorPostPreview } from './post-preview';
import { NextdoorPreviewProps } from './types';

type OptionalProps = Partial< Pick< NextdoorPreviewProps, 'name' | 'profileImage' > >;

export type NextdoorLinkPreviewProps = Omit< NextdoorPreviewProps, keyof OptionalProps > &
	OptionalProps;

export function NextdoorLinkPreview( props: NextdoorLinkPreviewProps ) {
	return (
		<NextdoorPostPreview
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
