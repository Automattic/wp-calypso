import { Button, Card, FormLabel } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

export default function WPCloudSignupPricing( props: { onNext: () => void } ) {
	const { onNext } = props;

	const translate = useTranslate();

	return (
		<Card>
			<div className="wpcloud-signup-pricing__title">{ translate( 'WP Cloud Pricing' ) }</div>
			<div className="wpcloud-signup-pricing__description">
				{ translate( 'Tell us about yourself and your business.' ) }
			</div>
			<div className="wpcloud-signup-pricing__consent1">
				<CheckboxControl onChange={ () => {} } />
				<FormLabel>
					{ translate(
						'I understand WP Cloud pricing and am ready to begin WP Cloud integration into our platform and marketing strategy'
					) }
				</FormLabel>
			</div>
			<div className="wpcloud-signup-pricing__consent2">
				<CheckboxControl onChange={ () => {} } />
				<FormLabel>
					{ translate(
						'I understand that our WP Cloud account will be subject to removal for misuse or lack of use in the next 3 months.'
					) }
				</FormLabel>
			</div>
			<Button primary onClick={ onNext }>
				{ translate( 'Submit' ) }
			</Button>
		</Card>
	);
}
