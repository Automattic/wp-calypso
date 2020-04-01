/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Continue,
	Link,
	Quit,
} from 'layout/guided-tours/config-elements';
import { AddContentButton } from 'layout/guided-tours/button-labels';
import { getSectionName, hasSidebar } from 'state/ui/selectors';
import { targetForSlug } from 'layout/guided-tours/positioning';

const sectionHasSidebar = state =>
	hasSidebar( state ) && ! includes( [ 'customize' ], getSectionName( state ) );

// When moving from stats to the editor, the menu disappears, the first step
// loses its target, and it repositions in the top left corner.
// This function immediately moves it outside of the viewport, and, as soon
// as the next step's target appears, the step is repositioned correctly.
const handleTargetDisappear = () => {
	const tourFirstStep = document.querySelector( '.guided-tours__step-first' );
	tourFirstStep.style.left = '-9999px';
};

// IE9+ polyfill for `Element.matches()` used in `DelegatingQuit`
if ( ! window.Element.prototype.matches ) {
	window.Element.prototype.matches = window.Element.prototype.msMatchesSelector;
}

class DelegatingQuit extends Quit {
	addTargetListener = () => {
		const { parentTarget } = this.props;
		const container = targetForSlug( parentTarget );

		if ( container && container.addEventListener ) {
			container.addEventListener( 'click', this.onParentClick );
			container.addEventListener( 'touchstart', this.onParentClick );
		}
	};

	removeTargetListener = () => {
		const { parentTarget } = this.props;
		const container = targetForSlug( parentTarget );

		if ( container && container.addEventListener ) {
			container.removeEventListener( 'click', this.onParentClick );
			container.removeEventListener( 'touchstart', this.onParentClick );
		}
	};

	onParentClick = event => {
		let eventTarget = event.target;
		// Event delegation
		while ( !! eventTarget && eventTarget !== event.currentTarget ) {
			if ( eventTarget.matches( this.props.target ) ) {
				this.props.onClick && this.props.onClick( event );
				const { quit, tour, tourVersion, step, isLastStep } = this.context;
				quit( { tour, tourVersion, step, isLastStep } );
				return;
			}
			eventTarget = eventTarget.parentNode;
		}
	};
}

export const SimplePaymentsEmailTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="side-menu-page"
			placement="beside"
			arrow="left-top"
			style={ { animationDelay: '2s', marginTop: '-5px' } }
			onTargetDisappear={ handleTargetDisappear }
			when={ sectionHasSidebar }
			keepRepositioning
			scrollContainer=".sidebar__region"
			shouldScrollTo
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
						<DelegatingQuit
							primary
							parentTarget=".tinymce-container"
							target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
						>
							{ translate( 'Got it, thanks!' ) }
						</DelegatingQuit>
					</ButtonRow>
					<Link href="https://wordpress.com/support/simple-payments">
						{ translate( 'Learn more about Simple Payments.' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
