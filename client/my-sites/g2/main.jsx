/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import { Button, Card } from '@automattic/components';

/**
 * Style Dependencies
 */

import './style.scss';

const TestingG2 = () => {
	return (
		<Main>
			<Card>
				<h1>Hello!</h1>
				<h2>I'm a heading.</h2>
				<h3>I'm also a heading...</h3>
				<h4>I'm a much smaller heading</h4>
				<div>
					<Button primary>Click me</Button>
					<Button>Secondary click me</Button>
				</div>
				<div>
					<Button compact>Compact click me</Button>
				</div>
				<Button borderless>Borderless click me</Button>
			</Card>
			<Card>
				<p>Some regular text within a card.</p>
			</Card>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<Card className="col-1">
				<h3>I'm a heading.</h3>
				<p>
					Laum Ipsum slower than molasses going uphill in January bluebries from away got in a gaum
					muckle riyht on'ta her can't get theyah from heeyah slower than molasses going uphill in
					January, gummah Powrtland aht wreckah fish chowdah crunchah. Dinnahbucket The County clam
					chowdah mistah man gettin' ugly what a cahd, Loyston-Ahban. Feed 'uh the hot suppah..
					Katahdin gummah potatoes.
				</p>
			</Card>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<Card className="col-2">
				<p>Some regular text within a card.</p>
				<Button primary>Click me</Button>
			</Card>
		</Main>
	);
};

export default TestingG2;
