/**
 * External dependencies
 */
import React from 'react';
import { action } from '@storybook/addon-actions';

import Button from '.';

export default { title: 'Button' };

const helloWorld = `Hello World!`;
const handleClick = action( 'click' );

const ButtonVariantions = ( props ) => (
	<>
		<Button onClick={ handleClick } { ...props }>
			{ helloWorld }
		</Button>{ ' ' }
		<Button primary onClick={ handleClick } { ...props }>
			{ helloWorld }
		</Button>
	</>
);

export const Normal = () => <ButtonVariantions />;
export const Compact = () => <ButtonVariantions compact />;
export const Busy = () => <ButtonVariantions busy />;
export const Scary = () => <ButtonVariantions scary />;
export const Borderless = () => <ButtonVariantions borderless />;
export const Disabled = () => <ButtonVariantions disabled />;
export const Link = () => <ButtonVariantions href="https://www.google.com/" target="_blank" />;
