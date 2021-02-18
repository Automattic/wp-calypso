/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { omit, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

const SharingButtonsPreviewAction = ( props ) => {
	const { active, position, icon, children } = props;
	const classes = classNames( 'sharing-buttons-preview-action', {
		'is-active': active,
		'is-top': startsWith( position, 'top' ),
		'is-right': position.endsWith( '-right' ),
		'is-bottom': startsWith( position, 'bottom' ),
		'is-left': position.endsWith( '-left' ),
	} );

	return (
		<button
			type="button"
			className={ classes }
			{ ...omit( props, [ 'active', 'position', 'icon' ] ) }
		>
			{ icon && <Gridicon icon={ icon } size={ 18 } /> }
			{ children }
		</button>
	);
};

SharingButtonsPreviewAction.propTypes = {
	active: PropTypes.bool,
	position: PropTypes.oneOf( [ 'top-left', 'top-right', 'bottom-left', 'bottom-right' ] ),
	icon: PropTypes.string,
	onClick: PropTypes.func,
};

SharingButtonsPreviewAction.defaultProps = {
	active: true,
	position: 'top-left',
	onClick: () => {},
};

export default SharingButtonsPreviewAction;
