import './style.scss';

export function getIsBlurredProps( { enabled = true }: { enabled?: boolean } = {} ) {
	return enabled ? { className: 'is-blurred', inert: 'true' } : {};
}
