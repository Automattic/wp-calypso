import { SocialPreviewBaseProps, SocialPreviewsBaseProps } from '../types';

export type TwitterPreviewsProps = SocialPreviewsBaseProps & {
	tweets: Array< TwitterPreviewProps >;
};

export type TwitterMedia = {
	alt: string;
	type: string;
	url: string;
};

export type TwitterCardProps = SocialPreviewBaseProps & {
	cardType: string;
};

export type SidebarProps = {
	showThreadConnector?: boolean;
	profileImage?: string;
};

export type HeaderProps = {
	name: string;
	date: Date | number;
	screenName: string;
};

export type MediaProps = {
	media?: Array< TwitterMedia >;
};

export type QuoteTweetProps = {
	tweet?: TwitterPreviewProps;
};

export type TextProps = {
	text: string;
	url: string;
};

export type TwitterPreviewProps = SidebarProps &
	HeaderProps &
	MediaProps &
	QuoteTweetProps &
	TwitterCardProps &
	Pick< TextProps, 'text' >;
