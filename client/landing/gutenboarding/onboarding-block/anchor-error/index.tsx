/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Title } from '@automattic/onboarding';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

const AnchorError: React.FunctionComponent = () => {
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );

	// If displaying this error, we don't want a title to display in the header.
	// Clear title on load.
	React.useEffect( () => {
		setSiteTitle( '' );
	}, [ setSiteTitle ] );

	return (
		<div className="anchor-error__flex-container">
			<div className="anchor-error__center">
				<Title>{ __( 'We’re sorry!' ) }</Title>
				<div className="anchor-error__text-container">
					{ __( 'We’re unable to locate your podcast.' ) }
					<br />
					{ __( 'Return to Anchor or continue with site creation.' ) }
				</div>

				<div className="anchor-error__button-container">
					<Button className="anchor-error__button" isPrimary href="/new">
						<span>{ __( 'Continue' ) }</span>
					</Button>
				</div>
				<div className="anchor-error__link-container">
					<Button className="anchor-error__link" isLink href="https://anchor.fm">
						<span>{ __( 'Back to Anchor.fm' ) }</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
export default AnchorError;
