/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import MaterialIcon from 'calypso/components/material-icon';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

/**
 * Style dependencies
 */
import './style.scss';

const Icon = ( { gridicon, materialIcon } ) => {
	if ( gridicon ) {
		return (
			<Gridicon
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="vertical-nav-item-enhanced__icon"
				icon={ gridicon }
			/>
		);
	}

	return (
		<MaterialIcon
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="vertical-nav-item-enhanced__icon"
			icon={ materialIcon }
		/>
	);
};

const VerticalNavItemEnhanced = ( {
	className,
	disabled,
	description,
	external,
	gridicon,
	materialIcon,
	path,
	onClick,
	text,
} ) => {
	const classes = classnames( 'vertical-nav-item-enhanced', className, { disabled } );

	return (
		<VerticalNavItem
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className={ classes }
			disabled={ disabled }
			external={ external }
			onClick={ onClick }
			path={ path }
		>
			<>
				<Icon gridicon={ gridicon } materialIcon={ materialIcon } />

				<div>
					<div>{ text }</div>

					<small>{ description }</small>
				</div>
			</>
		</VerticalNavItem>
	);
};

VerticalNavItemEnhanced.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	description: PropTypes.string.isRequired,
	external: PropTypes.bool,
	gridicon: PropTypes.string,
	materialIcon: PropTypes.string,
	onClick: PropTypes.func,
	path: PropTypes.string,
	text: PropTypes.string.isRequired,
};

export default VerticalNavItemEnhanced;
