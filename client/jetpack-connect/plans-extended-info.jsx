/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Card from '@automattic/components/card';
import FormattedHeader from 'components/formatted-header';

const PlansExtendedInfo = ( { recordTracks, translate } ) => (
	<Card className="jetpack-connect__plan-info">
		<img
			className="jetpack-connect__plan-info-illustration"
			src="/calypso/images/illustrations/jetpack-start.svg"
			alt=""
		/>
		<FormattedHeader
			headerText={ translate( 'Unsure which plan is right for you?' ) }
			subHeaderText={ translate(
				'Read our guide to choosing the right plan or compare plans in more detail.'
			) }
		/>
		<div className="jetpack-connect__plan-info-buttons">
			<Button
				primary
				href={ localizeUrl(
					'https://jetpack.com/2017/02/01/a-simple-guide-to-choosing-the-best-jetpack-plan-your-wordpress-site/'
				) }
				onClick={ recordTracks( 'plan_guide' ) }
				target="_blank"
			>
				{ translate( 'Plan Guide' ) }
			</Button>
			<Button
				href={ localizeUrl( 'https://jetpack.com/features/comparison' ) }
				onClick={ recordTracks( 'feature_comparison' ) }
				target="_blank"
			>
				{ translate( 'Feature Comparison' ) }
			</Button>
		</div>
	</Card>
);

PlansExtendedInfo.propTypes = {
	recordTracks: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( PlansExtendedInfo );
