import { SocialPreviewBaseProps } from '../types';

export type TwitterPreviewProps = TwitterCardProps & {
	tweets: Array< TweetProps >;
};

export type TwitterMedia = {
	alt: string;
	type: string;
	url: string;
};

export type TwitterCardProps = SocialPreviewBaseProps & {
	type: string;
};

export type SidebarProps = {
	isLast: boolean;
	profileImage: string;
};

export type HeaderProps = {
	name: string;
	date: Date | number;
	screenName: string;
};

export type MediaProps = {
	media: Array< TwitterMedia >;
};

export type QuoteTweetProps = {
	tweet: TweetProps;
};

export type CardProps = {
	card: TwitterCardProps;
};

export type TextProps = {
	text: string;
	cardUrl: string;
};

export type TweetProps = SidebarProps &
	HeaderProps &
	MediaProps &
	QuoteTweetProps &
	CardProps &
	Pick< TextProps, 'text' >;
