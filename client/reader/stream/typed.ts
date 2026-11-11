import Stream from 'calypso/reader/stream';
import type { trackScrollPage } from 'calypso/reader/controller-helper';
import type { ComponentType } from 'react';

/**
 * The `Stream` props TypeScript callers use. `Stream` is still a JS module with
 * PropTypes, so this is the one place its prop list is hand-typed.
 */
export interface StreamProps {
	streamKey: string;
	className?: string;
	followSource?: string;
	useCompactCards?: boolean;
	wideLayout?: boolean;
	showBylineSecondarySiteLink?: boolean;
	trackScrollPage?: typeof trackScrollPage;
}

export const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;
