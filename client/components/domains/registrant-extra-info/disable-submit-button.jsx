import { isEmpty, map } from 'lodash';
import { cloneElement } from 'react';

export function disableSubmitButton( children ) {
	if ( isEmpty( children ) ) {
		return children;
	}

	return map( Array.isArray( children ) ? children : [ children ], ( child, index ) =>
		cloneElement( child, {
			disabled: !! child.props.className.match( /submit-button/ ) || child.props.disabled,
			key: index,
		} )
	);
}
