import { JetpackLogo } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { Stack } from '@wordpress/ui';
import AutomatticBylineLogo from '../automattic-byline-logo';
import './style.scss';
import type { FC } from 'react';

/**
 * JetpackFooter component displays a tiny Jetpack logo on the left and the Automattic Airline "by line" on the right.
 */
const JetpackFooter: FC = () => {
	return (
		<Stack
			render={ <footer /> }
			className="jetpack-footer"
			aria-label={ __( 'Jetpack', 'jetpack-components' ) }
			role="contentinfo"
			direction="row"
			justify="space-between"
			align="center"
			wrap="wrap"
			gap="xl"
		>
			<Stack className="jetpack-footer__logo" direction="row" gap="sm" align="center">
				<JetpackLogo size={ 16 } />
				<span className="jetpack-footer__logo-text">Jetpack</span>
			</Stack>
			<a
				className="jetpack-footer__a8c"
				href="https://jetpack.com/redirect/?source=a8c-about"
				rel="noopener noreferrer"
				target="_blank"
			>
				<AutomatticBylineLogo height={ 8 } />
			</a>
		</Stack>
	);
};

export default JetpackFooter;
