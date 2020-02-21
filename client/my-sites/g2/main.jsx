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
				<Button primary>Click me</Button>
				<Button>Secondary click me</Button>
				<Button compact>Compact click me</Button>
				<Button borderless>Borderless click me</Button>
			</Card>
		</Main>
	);
};

export default TestingG2;
