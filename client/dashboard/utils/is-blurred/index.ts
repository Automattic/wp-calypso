import './style.scss';

export const IS_BLURRED_PROPS = {
	className: 'is-blurred',
	// Even for non-interactive elements we want this because it's equivalent to
	// `aria-hidden="true"`.
	inert: true,
};
