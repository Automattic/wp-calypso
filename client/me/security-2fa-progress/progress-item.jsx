/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import Gridicon from 'calypso/components/gridicon';

const Security2faProgressItem = ( { icon, label, step } ) => (
	<div
		className={ classNames( 'security-2fa-progress__item', {
			'is-highlighted': step?.isHighlighted,
			'is-completed': step?.isCompleted,
		} ) }
	>
		<Gridicon icon={ icon } />
		<FormLabel>{ label } </FormLabel>
	</div>
);

export default Security2faProgressItem;
