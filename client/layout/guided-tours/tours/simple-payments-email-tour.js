/** @format */
/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Continue,
	Quit,
} from 'layout/guided-tours/config-elements';
import { isDesktop } from 'lib/viewport';
import { AddContentButton } from '../button-labels';

class RepositioningStep extends Step {
	componentDidMount() {
		super.componentDidMount();
		this.interval = setInterval( () => {
			this.onScrollOrResize();
		}, 2000 );
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		clearInterval( this.interval );
	}
}

export const SimplePaymentsEmailTour = makeTour(
	<Tour name="simplePaymentsEmailTour" version="20180501" path="/" when={ and( isDesktop ) }>
		<RepositioningStep name="init" target="side-menu-page" placement="beside" arrow="left-top">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Start by creating a page — this is where your payment buttons will live.'
						) }
					</p>
					<Continue
						click
						hidden
						step="step2"
						target=".sidebar__menu li[data-post-type='page'] a.sidebar__button"
					/>
					<ButtonRow>
						<Quit>{ translate( 'Quit' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</RepositioningStep>
		<RepositioningStep
			name="step2"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
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
				</Fragment>
			) }
		</RepositioningStep>
	</Tour>
);
