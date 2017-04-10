/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Quit,
} from 'layout/guided-tours/config-elements';
import { isSelectedSiteCustomizable } from 'state/ui/guided-tours/contexts';

export const MenuRemovalTour = makeTour(
	<Tour name="menuRemoval" version="20170308" path="/stats" when={ isSelectedSiteCustomizable }>
		<Step name="init"
			target="themes"
			arrow="left-top"
			placement="beside"
			when={ isSelectedSiteCustomizable }
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<p>
				{
					translate( '{{strong}}New!{{/strong}} Create and edit navigation menus with live preview' +
						' in the {{strong}}Customizer{{/strong}}',
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Affirmative!' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
