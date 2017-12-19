/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	makeTour,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

export const ChecklistUserAvatarTour = makeTour(
	<Tour name="checklistUserAvatar" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			target="edit-gravatar"
			placement="beside"
			arrow="left-top"
			style={ {
				animationDelay: '0.7s',
			} }
		>
			<p>
				{ translate(
					'Personalize your posts and comments with a profile picture. ' +
						'Click on this image to upload your new image.'
				) }
			</p>
			<ButtonRow>
				<Continue target="edit-gravatar" step="finish" click hidden />
				<SiteLink isButton={ false } href="/checklist/:site">
					{ translate( 'Return to the checklist' ) }
				</SiteLink>
			</ButtonRow>
		</Step>

		<Step name="finish" placement="right">
			<h1 className="tours__title">
				<span className="tours__completed-icon-wrapper">
					<Gridicon icon="checkmark" className="tours__completed-icon" />
				</span>
				{ translate( 'Well done!' ) }
			</h1>
			<p>
				{ translate(
					'Your profile picture has been saved. ' +
						"Let's move on and see what's next on our checklist."
				) }
			</p>
			<SiteLink isButton href="/checklist/:site">
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
