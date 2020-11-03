/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	SiteLink,
	Link,
	Quit,
} from 'calypso/layout/guided-tours/config-elements';
import { localizeUrl } from 'calypso/lib/i18n-utils';

export const SimplePaymentsTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { animationDelay: '2s', marginLeft: '-10px', zIndex: 'auto' } }
		>
			{ ( { translate } ) => (
				<Fragment>
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
						<SiteLink
							isButton
							isPrimaryButton={ false }
							href={ '/plans/:site?customerType=business' }
							newWindow
						>
							<Gridicon icon="external" />
							<span>{ translate( 'Upgrade' ) }</span>
						</SiteLink>
					</ButtonRow>
					<Link href={ localizeUrl( 'https://wordpress.com/support/pay-with-paypal-button/' ) }>
						{ translate( 'Learn more about Pay with PayPal.' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
