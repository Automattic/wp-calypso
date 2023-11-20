import { SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type NextdoorPreviewProps = SocialPreviewBaseProps & {
	neighborhood?: string;
	name: string;
	profileImage: string;
};

export type NextdoorPreviewsProps = NextdoorPreviewProps & SocialPreviewsBaseProps;
