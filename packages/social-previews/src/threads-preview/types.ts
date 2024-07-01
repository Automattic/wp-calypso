import { MediaItem, SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type ThreadsPreviewsProps = SocialPreviewsBaseProps & {
	posts: Array< ThreadsPreviewProps >;
};

export type ThreadsCardProps = SocialPreviewBaseProps;

export type SidebarProps = {
	showThreadConnector?: boolean;
	profileImage?: string;
};

export type HeaderProps = {
	name?: string;
	date?: Date;
};

export type MediaProps = {
	media: Array< MediaItem >;
};

export type TextProps = {
	text: string;
	url: string;
};

export type ThreadsPreviewProps = SidebarProps &
	HeaderProps &
	Partial< ThreadsCardProps & Pick< TextProps, 'text' > >;
