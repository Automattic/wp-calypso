/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
} from 'layout/guided-tours/config-elements';

export const Trampoline = makeTour(
	<Tour name="trampoline" version="20170808" path="/view">
		<Step name="init" placement="right">
			<p><strong>Welcome to WordPress.com!</strong></p>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
				tempor incididunt ut labore et dolore magna aliqua.
			</p>
			<ButtonRow>
				<Next step="customize">Let's go!</Next>
			</ButtonRow>
		</Step>

		<Step name="customize" target="themes" arrow="left-top" placement="beside">
			<p>Click "Customize" to personalize your site's colors, fonts and more.</p>
			<ButtonRow>
				<Quit primary>Got it!</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
