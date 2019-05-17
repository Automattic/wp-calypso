/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';

const JetpackChecklistHeader = ( { isPaidPlan, translate } ) => (
	<Card compact className="jetpack-checklist__header">
		<img
			className="jetpack-checklist__header-illustration"
			alt=""
			aria-hidden="true"
			src="/calypso/images/illustrations/security.svg"
		/>
		<div className="jetpack-checklist__header-content">
			<CardHeading>
				{ translate( "Let's start by securing your site with a few essential security features" ) }
			</CardHeading>
			{ isPaidPlan && (
				<p>
					{ translate( 'These security features ensure that your site is secured and backed up.' ) }
				</p>
			) }
		</div>
	</Card>
);

export default localize( JetpackChecklistHeader );
