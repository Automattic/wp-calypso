/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';

const JetpackChecklistHeader = ( { isPaidPlan, translate } ) => (
	<Fragment>
		<Card compact className="jetpack-checklist__top">
			<strong>{ translate( 'My Checklist' ) }</strong>
		</Card>
		<Card compact className="jetpack-checklist__header">
			<img
				className="jetpack-checklist__header-illustration"
				alt=""
				aria-hidden="true"
				src="/calypso/images/illustrations/security.svg"
			/>
			<div className="jetpack-checklist__header-content">
				<CardHeading>
					{ translate(
						"Let's start by securing your site with a few essential security features"
					) }
				</CardHeading>
				{ isPaidPlan && (
					<p>
						{ translate(
							'These security features ensure that your site is secured and backed up.'
						) }
					</p>
				) }
			</div>
		</Card>
	</Fragment>
);

export default localize( JetpackChecklistHeader );
