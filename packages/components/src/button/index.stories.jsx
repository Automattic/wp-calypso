/**
 * External dependencies
 */
import React from 'react';
import { action } from '@storybook/addon-actions';

import Button from '.';

export default { title: 'Button' };

const helloWorld = `Hello World!`;
const handleClick = action( 'click' );

export const Default = () => <Button onClick={ handleClick }>{ helloWorld }</Button>;
export const IsPrimary = () => (
	<Button primary onClick={ handleClick }>
		{ helloWorld }
	</Button>
);
export const IsScary = () => (
	<Button scary onClick={ handleClick }>
		{ helloWorld }
	</Button>
);
export const IsBusy = () => (
	<Button busy onClick={ handleClick }>
		{ helloWorld }
	</Button>
);
export const IsBorderless = () => (
	<Button borderless onClick={ handleClick }>
		{ helloWorld }
	</Button>
);
export const AsLink = () => (
	<Button href="https://www.google.com/" target="_blank">
		{ helloWorld }
	</Button>
);
