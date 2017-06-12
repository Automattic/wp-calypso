/**
 * External dependencies
 */
import React from 'react';
import { stubTrue } from 'lodash';

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

export const MainTour = makeTour(
	<Tour name="main" version="test" path="/" when={ isNewUser } >
		<Step name="init" placement="right" when={ inSection( 'themes' ) } >
			Need a hand? We'd love to show you around the place.
		</Step>
	</Tour>
);

export const ThemesTour = makeTour(
	<Tour name="themes" version="test" path="/themes" when={ stubTrue } >
		<Step name="init" placement="right" when={ inSection( 'themes' ) } >
			Hey there! Want me to show you how to find a great theme for your site?
		</Step>
	</Tour>
);

export const StatsTour = makeTour(
	<Tour name="stats" version="test" path="/stats">
		<Step name="init" placement="right" when={ inSection( 'stats' ) } >
			Hey there! Want me to show you how to see and boost your stats?
		</Step>
	</Tour>
);

export const TestTour = makeTour(
	<Tour name="test" version="test" path={ [ '/test', '/foo' ] } when={ stubTrue } />
);

export default combineTours( {
	main: MainTour,
	themes: ThemesTour,
	stats: StatsTour,
	test: TestTour,
} );
