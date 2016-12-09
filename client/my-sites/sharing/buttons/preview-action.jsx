/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { omit, startsWith, endsWith } from 'lodash';

const SharingButtonsPreviewAction = ( props ) => {
	const { active, position, icon, children } = props;
	const classes = classNames( 'sharing-buttons-preview-action', {
		'is-active': active,
		'is-top': startsWith( position, 'top' ),
		'is-right': endsWith( position, '-right' ),
		'is-bottom': startsWith( position, 'bottom' ),
		'is-left': endsWith( position, '-left' )
	} );

	return (
		<button type="button" className={ classes } { ...omit( props, [ 'active', 'position', 'icon' ] ) }>
			{ icon && <span className={ 'noticon noticon-' + icon } /> }
			{ children }
		</button>
	);
};

SharingButtonsPreviewAction.propTypes = {
	active: PropTypes.bool,
	position: PropTypes.oneOf( [
		'top-left',
		'top-right',
		'bottom-left',
		'bottom-right'
	] ),
	icon: PropTypes.string,
	onClick: PropTypes.func
};

SharingButtonsPreviewAction.defaultProps = {
	active: true,
	position: 'top-left',
	onClick: () => {}
};

export default SharingButtonsPreviewAction;
