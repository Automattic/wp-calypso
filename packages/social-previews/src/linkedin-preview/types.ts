import { SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type LinkedInPreviewProps = SocialPreviewBaseProps & {
	jobTitle?: string;
	name: string;
	profileImage: string;
};

export type LinkedInPreviewsProps = LinkedInPreviewProps & SocialPreviewsBaseProps;
