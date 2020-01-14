/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { Gridicon } from '@automattic/components';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	ButtonRow,
	Continue,
	makeTour,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const JetpackVideoHostingTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target=".jetpack-video-hosting-settings .form-toggle__switch"
			arrow="top-left"
			placement="below"
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Flip this toggle to use our WordPress.com servers to host your videos — ' +
								"they'll be fast {{em}}and{{/em}} ad-free.",
							{
								components: {
									em: <em />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Continue
							target=".jetpack-video-hosting-settings .form-toggle__switch"
							step="finish"
							click
							hidden
						/>
						<SiteLink href="/plans/my-plan/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<h1 className="tours__title">
						<span className="tours__completed-icon-wrapper">
							<Gridicon icon="checkmark" className="tours__completed-icon" />
						</span>
						{ translate( 'Excellent, you’re done!' ) }
					</h1>
					<p>
						{ translate(
							'Video hosting is active on your site. Ready to move to the next feature?'
						) }
					</p>
					<ButtonRow>
						<SiteLink isButton href="/plans/my-plan/:site">
							{ translate( "Yes, let's do it." ) }
						</SiteLink>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
