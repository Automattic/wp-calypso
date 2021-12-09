/* eslint-disable jsdoc/require-param */
import { usePopper } from 'react-popper';
import type { PopperModifier } from '../';

type PopperProps = Partial< Pick< ReturnType< typeof usePopper >, 'styles' | 'attributes' > >;

const usePopperHandler = (
	referenceElement: HTMLElement | null,
	popperElement: HTMLElement | null,
	modifiers?: PopperModifier[]
): PopperProps => {
	const { styles, attributes } = usePopper( referenceElement, popperElement, {
		strategy: 'fixed',
		modifiers,
	} );

	return referenceElement ? { styles, attributes } : {};
};

export default usePopperHandler;
