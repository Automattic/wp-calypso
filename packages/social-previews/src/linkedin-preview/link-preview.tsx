import { DEFAULT_PROPS } from './constants';
import { LinkedInPostPreview } from './post-preview';
import { LinkedInPreviewProps } from './types';

type OptionalProps = Partial< typeof DEFAULT_PROPS >;

export type LinkedInLinkPreviewProps = Omit< LinkedInPreviewProps, keyof OptionalProps > &
	OptionalProps;

export function LinkedInLinkPreview( props: LinkedInLinkPreviewProps ) {
	return <LinkedInPostPreview { ...DEFAULT_PROPS } { ...props } />;
}
