/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderButton from 'components/header-button';

export default function HeaderButtonExample() {
	const onClick = () => alert( 'clicked me!' );
	return (
		<div>
			<HeaderButton
				icon="plus-small"
				label="Add Plugin"
				onClick={ onClick }
			/>
		</div>
		);
}

