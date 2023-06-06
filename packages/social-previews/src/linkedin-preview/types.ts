import { MediaItem, SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type LinkedInPreviewProps = SocialPreviewBaseProps & {
	jobTitle?: string;
	name: string;
	profileImage: string;
	media?: Array< MediaItem >;
	articleReadTime?: number;
};

export type LinkedInPreviewsProps = LinkedInPreviewProps & SocialPreviewsBaseProps;
