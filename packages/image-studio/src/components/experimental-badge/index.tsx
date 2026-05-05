import { Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './style.scss';

interface ExperimentalBadgeProps {
	variant?: 'light' | 'dark';
	withTooltip?: boolean;
}

export function ExperimentalBadge( {
	variant = 'light',
	withTooltip = false,
}: ExperimentalBadgeProps ): JSX.Element {
	const className = `image-studio-experimental-badge image-studio-experimental-badge--${ variant }`;
	const content = __( 'Experimental', __i18n_text_domain__ );

	if ( withTooltip ) {
		return (
			<Tooltip
				text={ __(
					'This is an experimental AI feature. Outputs may need editing before publishing.',
					__i18n_text_domain__
				) }
			>
				<span
					className={ className }
					// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can surface the tooltip
					tabIndex={ 0 }
				>
					{ content }
				</span>
			</Tooltip>
		);
	}

	return <span className={ className }>{ content }</span>;
}
