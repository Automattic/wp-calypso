/**
 * External dependencies
 *
 */
import { isDesktop } from '@automattic/viewport';
import React, { Fragment } from 'react';
import { overEvery as and } from 'lodash';
import Gridicon from 'components/gridicon';

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
import { hasSelectedSitePremiumOrBusinessPlan } from '../selectors/has-selected-site-premium-or-business-plan';

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
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Prepare for holiday shopping and end-of-year donations: ' +
								'add a {{strong}}payment button{{/strong}} to sell products and services or accept donations on your site!',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<div style={ { textAlign: 'center' } }>
						<img
							src="/calypso/images/illustrations/illustration-shopping-bags.svg"
							style={ { width: '210px', height: '160px', marginBottom: '10px' } }
							alt=""
						/>
					</div>
					<ButtonRow>
						<Next step="add-new-page">{ translate( 'Get started!' ) }</Next>
						<Quit>{ translate( 'No thanks.' ) }</Quit>
					</ButtonRow>
					<Link href="https://wordpress.com/support/simple-payments/">
						{ translate( 'Learn more about Simple Payments.' ) }
					</Link>
				</Fragment>
			) }
		</Step>
		<Step
			name="add-new-page"
			arrow="left-top"
			target="li[data-post-type=page] a.sidebar__button"
			placement="beside"
			style={ { marginTop: '-15px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'To add a payment button, create a page.' ) }</p>
					<Continue click step="editor-intro" target="li[data-post-type=page] a.sidebar__button">
						{ translate( 'Click {{strong}}Add{{/strong}} to continue.', {
							components: {
								strong: <strong />,
							},
						} ) }
					</Continue>
				</Fragment>
			) }
		</Step>
		<Step name="editor-intro" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Welcome to the Editor! ' ) }</p>
					<p>
						{ translate( 'Click {{strong}}Next{{/strong}} to learn how to add a payment button.', {
							components: {
								strong: <strong />,
							},
						} ) }
					</p>
					<ButtonRow>
						<Next step="editor-insert-button" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
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
			{ ( { translate } ) => (
				<Fragment>
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
				</Fragment>
			) }
		</Step>
		<Step
			name="editor-set-title"
			arrow="top-left"
			target=".editor-title"
			placement="below"
			style={ { marginTop: '-30px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Give your page a title here.' ) }</p>
					<ButtonRow>
						<Next step="publish" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="publish"
			arrow="right-top"
			target=".editor-ground-control__publish-button"
			placement="beside"
			style={ { marginTop: '-12px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
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
							'Remember: add your page to your site navigation so visitors can find it easily'
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Got it, thanks!' ) }</Quit>
					</ButtonRow>
					<Link href="https://wordpress.com/support/menus/">
						{ translate( 'Learn about managing menus' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
