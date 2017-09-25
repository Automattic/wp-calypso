/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import React from 'react';

const ActionRemove = ( props ) =>
	<button
		title={ props.translate( 'Remove', { textOnly: true } ) }
		{ ...omit( props, 'moment', 'numberFormat', 'translate' ) }
		className={ classNames( 'action-remove', props.className ) }
	>
		{ props.children }
	</button>;

export default localize( ActionRemove );
