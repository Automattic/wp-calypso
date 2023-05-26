import { SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type InstagramPreviewProps = Pick< SocialPreviewBaseProps, 'image' > & {
	name: string;
	profileImage: string;
	caption?: string;
};

export type InstagramPreviewsProps = InstagramPreviewProps & SocialPreviewsBaseProps;
