import { __ } from '@wordpress/i18n';
import './style.scss';

interface ExperimentalBadgeProps {
	variant?: 'light' | 'dark';
}

export function ExperimentalBadge( { variant = 'light' }: ExperimentalBadgeProps ): JSX.Element {
	const className = `image-studio-experimental-badge image-studio-experimental-badge--${ variant }`;
	return (
		<span className={ className }>{ __( 'Experimental Preview', __i18n_text_domain__ ) }</span>
	);
}
