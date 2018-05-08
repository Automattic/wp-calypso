/** @format */
/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Continue,
	Link,
	Quit,
} from 'layout/guided-tours/config-elements';
import { AddContentButton } from '../button-labels';

// When moving from stats to the editor, the menu disappears, the first step
// loses its target, and it repositions in the top left corner.
// This function immediately moves it outside of the viewport, and, as soon
// as the next step's target appears, the step is repositioned correctly.
const handleTargetDisappear = () => {
	const tourFirstStep = document.querySelector( '.guided-tours__step-first' );
	tourFirstStep.style.left = '-9999px';
};

export const SimplePaymentsEmailTour = makeTour(
	<Tour name="simplePaymentsEmailTour" version="20180501" path="/" when={ noop }>
		<Step
			name="init"
			target="side-menu-page"
			placement="beside"
			arrow="left-top"
			style={ { animationDelay: '2s', marginTop: '-5px' } }
			onTargetDisappear={ handleTargetDisappear }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Start by creating a page — this is where your payment buttons will live.'
						) }
					</p>
					<Continue
						click
						step="choose-payment-button"
						target=".sidebar__menu li[data-post-type='page'] a.sidebar__button"
					>
						{ translate( 'Click {{strong}}Add{{/strong}} to continue.', {
							components: {
								strong: <strong />,
							},
						} ) }
					</Continue>
					<ButtonRow>
						<Quit>{ translate( 'Quit' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="choose-payment-button"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '-7px', zIndex: 'auto' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate( 'Click on {{addContentButton/}} and choose Payment Button.', {
							components: { addContentButton: <AddContentButton /> },
						} ) }
					</p>
					<p>
						{ translate(
							"You'll be able to set a price, upload a photo, and describe your product or cause."
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Got it, thanks!' ) }</Quit>
					</ButtonRow>
					<Link href="https://en.support.wordpress.com/simple-payments">
						{ translate( 'Learn more about Simple Payments.' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
