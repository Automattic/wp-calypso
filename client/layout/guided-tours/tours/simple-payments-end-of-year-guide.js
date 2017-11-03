/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Continue,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Link,
} from 'layout/guided-tours/config-elements';
import { hasSelectedSitePremiumOrBusinessPlan } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const SimplePaymentsEndOfYearGuide = makeTour(
	<Tour
		name="simplePaymentsEndOfYearGuide"
		version="20171103"
		path={ [
			'/stats',
			'/plans',
			'/pages',
			'/posts',
			'/media',
			'/comments',
			'/types',
			'/themes',
			'/sharing',
			'/people',
			'/plugins',
			'/settings',
		] }
		when={ and( isDesktop, hasSelectedSitePremiumOrBusinessPlan ) }
	>
		<Step name="init" placement="right">
			<p>
				{ translate(
					'Now is a great time to add a {{strong}}Payment Button!{{/strong}} Do you have something to sell? ' +
						'Would you like to accept donations? Get your site ready for Cyber Monday and end-of-year giving. ' +
						'People will spend $3 billion online!',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<img
				src="https://i0.wp.com/en-support.files.wordpress.com/2017/03/editor-content-area_360.gif"
				style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
			/>
			<ButtonRow>
				<Next step="add-new-page">{ translate( 'Get started!' ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</ButtonRow>
			<Link href="https://learn.wordpress.com/get-published/">
				{ translate( 'Learn more about Simple Payments.' ) }
			</Link>
		</Step>
		<Step
			name="add-new-page"
			arrow="left-top"
			target="li[data-post-type=page] a.sidebar__button"
			placement="beside"
			style={ { marginTop: '-15px' } }
		>
			<p>
				{ translate( 'To start, create a new page — this is where the Payment Button will live.' ) }
			</p>
			<Continue click step="editor-intro" target="li[data-post-type=page] a.sidebar__button">
				{ translate( 'Click {{strong}}Add{{/strong}} to continue.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</Continue>
		</Step>
		<Step name="editor-intro" placement="center">
			<p>
				{ translate( 'You can add Payment Buttons to any post or page from the Editor.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
			<ButtonRow>
				<Next step="editor-insert-button" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="editor-insert-button"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
			style={ {
				marginLeft: '-7px',
				zIndex: 'auto',
			} }
		>
			<p>
				{ translate(
					'Click the {{icon/}} and choose the {{strong}}Payment Button{{/strong}}. ' +
						'You will be able to set a price, upload a photo, and describe your product or cause.',
					{
						components: {
							strong: <strong />,
							icon: <Gridicon icon="add-outline" />,
						},
					}
				) }
			</p>
			<ButtonRow>
				<Next step="editor-set-title" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="editor-set-title"
			arrow="top-left"
			target=".editor-title"
			placement="below"
			style={ { marginTop: '-30px' } }
		>
			<p>{ translate( 'Give your page a title here.' ) }</p>
			<ButtonRow>
				<Next step="publish" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="publish"
			arrow="right-top"
			target=".editor-ground-control__publish-button"
			placement="beside"
			style={ { marginTop: '-12px' } }
		>
			<p>
				{ translate(
					'Happy with your new page? Click {{strong}}Publish{{/strong}} to start collecting payments!',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					"Don't forget: add your new page to your site's navigation menu so people can find it easily."
				) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Got it, thanks!' ) }</Quit>
			</ButtonRow>
			<Link href="https://en.support.wordpress.com/menus/">
				{ translate( 'Learn more about Customizing Your Navigation.' ) }
			</Link>
		</Step>
	</Tour>
);
