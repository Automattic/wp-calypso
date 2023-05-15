import { DEFAULT_PROPS } from './constants';
import { TwitterPostPreview } from './post-preview';
import { TwitterPreviewProps } from './types';

type OptionalProps = Partial< typeof DEFAULT_PROPS >;

export type TwitterLinkPreviewProps = Omit< TwitterPreviewProps, keyof OptionalProps > &
	OptionalProps;

export const TwitterLinkPreview: React.FC< TwitterLinkPreviewProps > = ( props ) => {
	return <TwitterPostPreview { ...DEFAULT_PROPS } { ...props } text="" />;
};
