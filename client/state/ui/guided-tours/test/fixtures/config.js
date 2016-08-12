/**
 * External dependencies
 */
import React from 'react';
import { constant } from 'lodash';

/**
 * Internal dependencies
 */
import {
	combineTours,
	makeTour,
	Tour,
	Step,
} from 'layout/guided-tours/config-elements';

import { isNewUser, inSection } from 'state/ui/guided-tours/contexts';

const always = constant( true );
const isThemesEligible = ( state ) => ! state.themesDisabled;

export const MainTour = makeTour(
	<Tour name="main" version="test" path="/" when={ isNewUser } >
		<Step name="init" placement="right" when={ inSection( 'themes' ) } >
			{ "Need a hand? We'd love to show you around the place." }
		</Step>
	</Tour>
);

export const ThemesTour = makeTour(
	<Tour name="themes" version="test" path="/design" when={ isThemesEligible } >
		<Step name="init" placement="right" when={ inSection( 'themes' ) } >
			{ 'Hey there! Want me to show you how to find a great theme for your site?' }
		</Step>
	</Tour>
);

export const TestTour = makeTour(
	<Tour name="test" version="test" path="/test" when={ always } />
);

export default combineTours( {
	main: MainTour,
	themes: ThemesTour,
	test: TestTour,
} );
