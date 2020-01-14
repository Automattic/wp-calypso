/**
 * External dependencies
 */
import React from 'react';
import { action } from '@storybook/addon-actions';

import Card from '.';
import CompactCard from './compact';

const handleClick = action( 'click' );

export default { title: 'Card' };

export const Default = () => (
	<div>
		<Card>I am a Card.</Card>
		<Card>I am another card.</Card>
	</div>
);
export const Link = () => <Card href="#cards">I am a linkable card</Card>;
export const ExternalLink = () => (
	<Card href="#cards" rel="noopener noreferrer" target="_blank">
		I am a externally linked Card
	</Card>
);
export const Button = () => (
	<Card displayAsLink onClick={ handleClick } tagName="button">
		I am a clickable button that looks like a link
	</Card>
);
export const Info = () => <Card highlight="info">I am a Card, highlighted as info</Card>;
export const Success = () => <Card highlight="success">I am a Card, highlighted as success</Card>;
export const Error = () => <Card highlight="error">I am a Card, highlighted as error</Card>;
export const Warning = () => <Card highlight="warning">I am a Card, highlighted as warning</Card>;
export const Compact = () => (
	<div>
		<CompactCard>I am a CompactCard.</CompactCard>
		<CompactCard>I am another CompactCard.</CompactCard>
	</div>
);
