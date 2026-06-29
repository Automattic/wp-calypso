import {
	useMarkAsSeenBlogMutation,
	useMarkAsSeenMutation,
	useMarkAsUnseenBlogMutation,
	useMarkAsUnseenMutation,
} from './use-mutations';
import type { ComponentType } from 'react';

/**
 * Props injected by `withSeenPostsMutations`. These mirror the legacy
 * `calypso/state/reader/seen-posts/actions` so the existing
 * class-component keep working unchanged after the Redux → React Query migration.
 */
export interface SeenPostsMutationsProps {
	requestMarkAsSeen: ReturnType< typeof useMarkAsSeenMutation >[ 'mutate' ];
	requestMarkAsUnseen: ReturnType< typeof useMarkAsUnseenMutation >[ 'mutate' ];
	requestMarkAsSeenBlog: ReturnType< typeof useMarkAsSeenBlogMutation >[ 'mutate' ];
	requestMarkAsUnseenBlog: ReturnType< typeof useMarkAsUnseenBlogMutation >[ 'mutate' ];
}

/**
 * Higher-order component that wires the seen-posts mutation hooks and forwards
 * their `mutate` callbacks to the wrapped component under the legacy prop
 * names. The hooks must run inside the render phase (they call
 * `useQueryClient`/`useDispatch`), which is why this is a render-scope wrapper
 * rather than `connect`'s `mapDispatchToProps`.
 */
export function withSeenPostsMutations< P extends Partial< SeenPostsMutationsProps > >(
	WrappedComponent: ComponentType< P >
): ComponentType< Omit< P, keyof SeenPostsMutationsProps > > {
	function WithSeenPostsMutations( props: Omit< P, keyof SeenPostsMutationsProps > ) {
		const { mutate: requestMarkAsSeen } = useMarkAsSeenMutation();
		const { mutate: requestMarkAsUnseen } = useMarkAsUnseenMutation();
		const { mutate: requestMarkAsSeenBlog } = useMarkAsSeenBlogMutation();
		const { mutate: requestMarkAsUnseenBlog } = useMarkAsUnseenBlogMutation();

		return (
			<WrappedComponent
				{ ...( props as P ) }
				requestMarkAsSeen={ requestMarkAsSeen }
				requestMarkAsUnseen={ requestMarkAsUnseen }
				requestMarkAsSeenBlog={ requestMarkAsSeenBlog }
				requestMarkAsUnseenBlog={ requestMarkAsUnseenBlog }
			/>
		);
	}

	const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	WithSeenPostsMutations.displayName = `withSeenPostsMutations(${ wrappedName })`;

	return WithSeenPostsMutations;
}
