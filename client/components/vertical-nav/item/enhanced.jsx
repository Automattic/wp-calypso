import { Gridicon, MaterialIcon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

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
	description,
	disabled,
	external,
	gridicon,
	materialIcon,
	onClick,
	path,
	text,
} ) => {
	const classes = clsx( 'vertical-nav-item-enhanced', className, { disabled } );

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
	description: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	external: PropTypes.bool,
	gridicon: PropTypes.string,
	materialIcon: PropTypes.string,
	onClick: PropTypes.func,
	path: PropTypes.string,
	text: PropTypes.string.isRequired,
};

export default VerticalNavItemEnhanced;
