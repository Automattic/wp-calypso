/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { formatBold, formatItalic, link as linkIcon, more } from '@wordpress/icons';
import { Button } from '@wordpress/components';

/**
 * Style dependencies
 */
import './button.scss';

export const primary = () => {
	const label = 'Primary Button';

	return <Button isPrimary>{ label }</Button>;
};

export const secondary = () => {
	const label = 'Secondary Button';

	return <Button isSecondary>{ label }</Button>;
};

export const tertiary = () => {
	const label = 'Tertiary Button';

	return <Button isTertiary>{ label }</Button>;
};

export const isDestructive = () => {
	const label = 'Destructive Button';
	const isSmall = false;
	const disabled = false;

	return (
		<Button isDestructive isSmall={ isSmall } disabled={ disabled }>
			{ label }
		</Button>
	);
};

export const small = () => {
	const label = 'Small Button';

	return <Button isSmall>{ label }</Button>;
};

export const pressed = () => {
	const label = 'Pressed Button';

	return <Button isPressed>{ label }</Button>;
};

export const disabled = () => {
	const label = 'Disabled Button';

	return <Button disabled>{ label }</Button>;
};

export const disabledFocusable = () => {
	const label = 'Disabled Button';

	return (
		<Button disabled __experimentalIsFocusable>
			{ label }
		</Button>
	);
};

export const link = () => {
	const label = 'Link Button';

	return (
		<Button href="https://wordpress.org/" target="_blank">
			{ label }
		</Button>
	);
};

export const disabledLink = () => {
	const label = 'Disabled Link Button';

	return (
		<Button href="https://wordpress.org/" target="_blank" disabled>
			{ label }
		</Button>
	);
};

export const destructiveLink = () => {
	const label = 'Destructive Link';

	return (
		<Button isDestructive isLink>
			{ label }
		</Button>
	);
};

export const icon = () => {
	const usedIcon = 'ellipsis';
	const label = 'More';
	const size = 10;

	return <Button icon={ usedIcon } label={ label } iconSize={ size } />;
};

export const disabledFocusableIcon = () => {
	const usedIcon = 'ellipsis';
	const label = 'More';
	const size = 10;

	return (
		<Button
			icon={ usedIcon }
			label={ label }
			iconSize={ size }
			disabled
			__experimentalIsFocusable
		/>
	);
};

export const groupedIcons = () => {
	const GroupContainer = ( { children } ) => (
		<div style={ { display: 'inline-flex' } }>{ children }</div>
	);

	return (
		<GroupContainer>
			<Button icon={ formatBold } label="Bold" />
			<Button icon={ formatItalic } label="Italic" />
			<Button icon={ linkIcon } label="Link" />
		</GroupContainer>
	);
};

const Example = () => {
	return (
		<div style={ { padding: '20px' } }>
			<h2>Small Buttons</h2>
			<div className="wordpress-components-gallery-buttons__container">
				<Button isSmall>Button</Button>
				<Button isPrimary isSmall>
					Primary Button
				</Button>
				<Button isSecondary isSmall>
					Secondary Button
				</Button>
				<Button isTertiary isSmall>
					Tertiary Button
				</Button>
				<Button isSmall icon={ more } />
				<Button isSmall isPrimary icon={ more } />
				<Button isSmall isSecondary icon={ more } />
				<Button isSmall isTertiary icon={ more } />
				<Button isSmall isPrimary icon={ more }>
					Icon & Text
				</Button>
			</div>

			<h2>Regular Buttons</h2>
			<div className="story-buttons-container">
				<Button>Button</Button>
				<Button isPrimary>Primary Button</Button>
				<Button isSecondary>Secondary Button</Button>
				<Button isTertiary>Tertiary Button</Button>
				<Button icon={ more } />
				<Button isPrimary icon={ more } />
				<Button isSecondary icon={ more } />
				<Button isTertiary icon={ more } />
				<Button isPrimary icon={ more }>
					Icon & Text
				</Button>
			</div>
		</div>
	);
};

export default Example;
