import { SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type LinkedInPreviewProps = SocialPreviewBaseProps & {
	jobTitle?: string;
	name: string;
	profileImage: string;
	articleReadTime?: number;
};

export type LinkedInPreviewsProps = LinkedInPreviewProps & SocialPreviewsBaseProps;
