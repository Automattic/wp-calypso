/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Title } from '@automattic/onboarding';

/**
 * Style dependencies
 */
import './style.scss';

const AnchorError: React.FunctionComponent = () => {
	return (
		<div className="anchor-error__container">
			<div className="anchor-error__center">
				<Title>{ __( 'We’re sorry!' ) }</Title>
				<div className="anchor-error__text-container">
					We’re unable to locate your podcast.
					<br />
					Return to Anchor or continue with site creation.
				</div>

				<div className="anchor-error__button-container">
					<Button isPrimary href="/new" className="anchor-error__button">
						{ __( 'Continue' ) }
					</Button>
				</div>
				<div className="anchor-error__link-container">
					<Button isLink href="https://anchor.fm">
						{ __( 'Back to Anchor.fm' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};
export default AnchorError;
