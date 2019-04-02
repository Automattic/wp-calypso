/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import { makeTour, Tour, Step, ButtonRow, Quit } from 'layout/guided-tours/config-elements';

export const PluginsBasicTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			arrow="left-middle"
			target=".manage_menu__plugins-extra-icon"
			placement="below"
			style={ { animationDelay: '2s', marginTop: '-89px', marginLeft: '40px' } }
			scrollContainer=".sidebar__region"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Manage plugin settings, and install more plugins here' ) }</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Got it.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
