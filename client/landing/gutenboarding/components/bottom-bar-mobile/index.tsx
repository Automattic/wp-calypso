/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Link from '../link';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	backUrl: string;
	onContinue: () => void;
}

const BottomBarMobile: React.FunctionComponent< Props > = ( { backUrl, onContinue } ) => {
	const { __ } = useI18n();
	return (
		<div className="bottom-bar-mobile">
			<Link className="bottom-bar-mobile__go-back-button" isLink to={ backUrl }>
				{ __( 'Go back' ) }
			</Link>
			<Button
				className="bottom-bar-mobile__continue-button"
				isPrimary
				isLarge
				onClick={ onContinue }
			>
				{ __( 'Continue' ) }
			</Button>
		</div>
	);
};

export default BottomBarMobile;
