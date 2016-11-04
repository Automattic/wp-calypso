/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';

import React from 'react';
import { get } from 'lodash';
import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
} from 'layout/guided-tours/config-elements';
const firstSeconds = state => {
	const a = get( state, 'ui.queryArguments.initial._timestamp' );
	const b = Date.now();
	return a && ( b - a ) < 8000;
};
const MockTourOne = makeTour(
	<Tour name="MockTourOne" version="20161102" path="/" when={ firstSeconds }>
		<Step name="init" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				This is mock tour #1!
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="second">Next</Next>
			</div>
		</Step>
		<Step name="second" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				[ still tour #1 ] Woot!
			</p>
			<div className="guided-tours__choice-button-row">
				<Quit>Done</Quit>
			</div>
		</Step>
	</Tour>
);
const MockTourTwo = makeTour(
	<Tour name="MockTourTwo" version="20161102" path="/">
		<Step name="init" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				This is mock tour #2!
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="second">Next</Next>
			</div>
		</Step>
		<Step name="second" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				[ still tour #2 ]
			</p>
			<div className="guided-tours__choice-button-row">
				<Quit>Done</Quit>
			</div>
		</Step>
	</Tour>
);

export default combineTours( {
	MockTourOne,
	MockTourTwo,
} );
