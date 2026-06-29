import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const SharingButtonsPreviewAction = ( {
	active = true,
	position = 'top-left',
	icon,
	onClick = () => {},
	children,
	...props
} ) => {
	const classes = clsx( 'sharing-buttons-preview-action', {
		'is-active': active,
		'is-top': position.startsWith( 'top' ),
		'is-right': position.endsWith( '-right' ),
		'is-bottom': position.startsWith( 'bottom' ),
		'is-left': position.endsWith( '-left' ),
	} );

	return (
		<button type="button" className={ classes } onClick={ onClick } { ...props }>
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

export default SharingButtonsPreviewAction;
