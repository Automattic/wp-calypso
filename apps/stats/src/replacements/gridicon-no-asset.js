import classnames from 'classnames';
import React from 'react';

const Gridicon = React.memo(
	React.forwardRef( ( props, ref ) => {
		const { size = 24, icon, className, title, ...otherProps } = props;
		const isModulo18 = size % 18 === 0;

		// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
		// This means we don't need to perform any checks on the icon name.
		const iconName = `gridicons-${ icon }`;

		const iconClass = classnames( 'gridicon', iconName, className, {
			'needs-offset': isModulo18,
			'needs-offset-x': isModulo18,
			'needs-offset-y': isModulo18,
		} );

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				className={ iconClass }
				height={ size }
				width={ size }
				ref={ ref }
				{ ...otherProps }
			>
				{ title && <title>{ title }</title> }
				<use xlinkHref={ `#${ iconName }` } />
			</svg>
		);
	} )
);

Gridicon.displayName = 'Gridicon';

export default Gridicon;
