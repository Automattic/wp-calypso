/**
 * External dependencies
 */
import * as React from 'react';
import { Button, SVG, Circle } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

const circle = (
	<SVG viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="5" />
	</SVG>
);

interface Props {
	title: string;
	isCompleted: boolean;
	isCurrent: boolean;
	isDisabled: boolean;
	onClick: () => void;
}

const LaunchMenuItem: React.FunctionComponent< Props > = ( {
	title,
	isCompleted,
	isCurrent,
	isDisabled,
	onClick,
} ) => {
	return (
		<Button
			className={ classnames( 'nux-launch-menu__item', {
				'is-current': isCurrent,
				'is-completed': isCompleted,
			} ) }
			onClick={ onClick }
			disabled={ isDisabled }
			isLink
		>
			<Icon icon={ isCompleted ? check : circle } size={ 16 } />
			<span>{ title }</span>
		</Button>
	);
};

export default LaunchMenuItem;
