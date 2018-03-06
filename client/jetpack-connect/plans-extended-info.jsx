/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';

const PlansExtendedInfo = ( { onClick, translate } ) => {
	const headerText = translate( 'Unsure which plan is right for you?' );
	const subheaderText = translate(
		'Read out guide to choosing the right plan or compare plans in more detail.'
	);

	return (
		<Card className="jetpack-connect__plan-info">
			<img
				className="jetpack-connect__plan-info-illustration"
				src={ '/calypso/images/illustrations/jetpack-start.svg' }
				alt=""
			/>
			<FormattedHeader
				className="jetpack-connect__plan-help"
				headerText={ headerText }
				subHeaderText={ subheaderText }
			/>
			<div className="jetpack-connect__plan-info-buttons">
				<Button
					primary
					href={
						'https://jetpack.com/2017/02/01/a-simple-guide-to-choosing-the-best-jetpack-plan-your-wordpress-site/'
					}
					onClick={ onClick( 'plan_guide' ) }
				>
					{ translate( 'Plan Guide' ) }
				</Button>
				<Button
					href={ 'https://jetpack.com/features/comparison' }
					onClick={ onClick( 'feature_comparison' ) }
				>
					{ translate( 'Feature Comparison' ) }
				</Button>
			</div>
		</Card>
	);
};

export default localize( PlansExtendedInfo );
