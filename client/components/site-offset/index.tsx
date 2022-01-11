import { useContext } from 'react';
import { SiteOffsetContext, contextTypeLoaded } from './context';
import type { FC, ComponentType } from 'react';

export type applySiteOffsetType = contextTypeLoaded;

interface ApplySiteOffsetProps {
	applySiteOffset: applySiteOffsetType | null;
}

export function withApplySiteOffset< ComponentProps >(
	WrappedComponent: ComponentType< ComponentProps & ApplySiteOffsetProps >
): FC< ComponentProps > {
	return function WithApplySiteOffset( props ) {
		return (
			<SiteOffsetContext.Consumer>
				{ ( applySiteOffset ) => (
					<WrappedComponent { ...props } applySiteOffset={ applySiteOffset } />
				) }
			</SiteOffsetContext.Consumer>
		);
	};
}

export const useApplySiteOffset = () => {
	return useContext( SiteOffsetContext );
};
