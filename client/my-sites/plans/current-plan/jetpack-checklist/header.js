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

const JetpackChecklistHeader = ( { isCompleted, translate } ) => (
	<Card compact className="jetpack-checklist__header">
		<img
			className="jetpack-checklist__header-illustration"
			alt=""
			aria-hidden="true"
			src="/calypso/images/illustrations/security.svg"
		/>
		<div className="jetpack-checklist__header-content">
			<CardHeading>
				{ isCompleted ? (
					<>
						{ translate( 'Congratulations' ) }
						<p>
							{ translate(
								"You've completed setting up all of the essential security and performance features. Going forward, you can access these features in the Settings sidebar menu."
							) }
						</p>
					</>
				) : (
					translate(
						"Let's start by securing your site with a few essential security and performance features"
					)
				) }
			</CardHeading>
		</div>
	</Card>
);

export default localize( JetpackChecklistHeader );
