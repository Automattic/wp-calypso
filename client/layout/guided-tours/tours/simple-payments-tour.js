/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import { makeTour, Tour, Step, ButtonRow, Link, Quit } from 'layout/guided-tours/config-elements';
import { isNotNewUser } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const SimplePaymentsTour = makeTour(
	<Tour
		name="simplePaymentsTour"
		version="20170816"
		path="/post/"
		when={ and( isDesktop, isNotNewUser ) }
	>
		<Step
			name="init"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '-10px', zIndex: 'auto' } }
		>
			<p>
				{ translate(
					'Did you know? ' +
						'Sites on the Premium and Business plans can add {{strong}}payment buttons{{/strong}} — ' +
						'sell tickets, collect donations, accept tips, and more.',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Got it, thanks!' ) }</Quit>
			</ButtonRow>
			<Link href="https://en.support.wordpress.com/simple-payments">
				{ translate( 'Learn more about Simple Payments.' ) }
			</Link>
		</Step>
	</Tour>
);
