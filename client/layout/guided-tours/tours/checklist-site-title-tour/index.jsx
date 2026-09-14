import { Gridicon } from '@automattic/components';
import { Fragment } from 'react';
import { SiteTitleButton, SiteTaglineButton } from 'calypso/layout/guided-tours/button-labels';
import {
	ButtonRow,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'calypso/layout/guided-tours/config-elements';
import meta from './meta';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistSiteTitleTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="site-tagline-input"
			placement="below"
			style={ {
				animationDelay: '0.7s',
				zIndex: 100190,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Update the {{siteTitleButton/}} and {{siteTaglineButton/}} fields ' +
								'to let visitors clearly identify your site.',
							{
								components: {
									siteTitleButton: <SiteTitleButton />,
									siteTaglineButton: <SiteTaglineButton />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Continue target="settings-site-profile-save" step="finish" click hidden />
						<Next step="click-save">{ translate( 'All done, continue' ) }</Next>
						<SiteLink href="/home/:site">{ translate( 'Return to My Home' ) }</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-save"
			target="settings-site-profile-save"
			arrow="top-right"
			placement="below"
			style={ {
				zIndex: 100190,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="settings-site-profile-save" step="finish" click>
						{ translate(
							'Almost done — every time you make a change, it needs to be saved. ' +
								'Let’s save your changes and then see what’s next on our list.'
						) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step
			name="finish"
			placement="right"
			style={ {
				zIndex: 100190,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<h1 className="tours__title">
						<span className="tours__completed-icon-wrapper">
							<Gridicon icon="checkmark" className="tours__completed-icon" />
						</span>
						{ translate( 'Good job, looks great!' ) }
					</h1>
					<p>
						{ translate(
							'Your changes have been saved. Let’s move on and see what’s next on our checklist.'
						) }
					</p>
					<SiteLink isButton href="/home/:site">
						{ translate( 'Return to My Home' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
