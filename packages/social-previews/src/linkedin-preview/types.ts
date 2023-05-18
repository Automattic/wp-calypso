import { MediaItem, SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type LinkedInPreviewProps = SocialPreviewBaseProps & {
	jobTitle?: string;
	name: string;
	profileImage: string;
	media?: Array< MediaItem >;
};

export type LinkedInPreviewsProps = LinkedInPreviewProps & SocialPreviewsBaseProps;
