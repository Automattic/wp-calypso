/**
 * External dependencies
 */
import React from 'react';
import { action } from '@storybook/addon-actions';

import Button from '.';

export default { title: 'Button' };

const helloWorld = `Hello World!`;
const handleClick = action( 'click' );

const ButtonVariations = ( props ) => (
	<>
		<Button onClick={ handleClick } { ...props }>
			{ helloWorld }
		</Button>{ ' ' }
		<Button primary onClick={ handleClick } { ...props }>
			{ helloWorld }
		</Button>
	</>
);

export const Normal = () => <ButtonVariations />;
export const Compact = () => <ButtonVariations compact />;
export const Busy = () => <ButtonVariations busy />;
export const Scary = () => <ButtonVariations scary />;
export const Borderless = () => <ButtonVariations borderless />;
export const Disabled = () => <ButtonVariations disabled />;
export const Link = () => <ButtonVariations href="https://www.google.com/" target="_blank" />;
export const Plain = () => <ButtonVariations plain />;
