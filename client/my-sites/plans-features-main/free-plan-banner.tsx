/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

type Props = {
	hidden: boolean;
	isInSignup: boolean;
	isReskinned: boolean;
	flowName: string;
	customHeader: React.Component | null;
	onUpgradeClick: ( plan: any ) => void;
};

const FreePlanBanner: React.FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const className = 'is-free-plan';
	const continueSite = translate( 'Continue with your free site' );
	const startSite = translate( 'Start with a free site' );
	const isSignedUserInLaunchSite = props.isInSignup && props.flowName === 'launch-site';

	if ( props.hidden || !! props.customHeader ) {
		return null;
	}

	return (
		<div className="plans-features-main__banner">
			<div className="plans-features-main__banner-content">
				<span>{ translate( 'Not sure yet?' ) }</span>
				<Button
					className={ className }
					onClick={ () => props.onUpgradeClick?.( null ) }
					borderless={ ! props.isReskinned }
				>
					{ isSignedUserInLaunchSite ? continueSite : startSite }
				</Button>
			</div>
		</div>
	);
};

export default FreePlanBanner;
