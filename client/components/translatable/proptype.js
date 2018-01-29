/** @format */

function translatableStringChecker( props, propName, componentName ) {
	componentName = componentName || 'ANONYMOUS';

	if ( props[ propName ] ) {
		const value = props[ propName ];
		if ( 'string' === typeof props[ propName ] ) {
			return null;
		}

		if (
			'object' === typeof value &&
			'function' === typeof value.type &&
			'data' === value.type.name
		) {
			return null;
		}

		return new Error(
			'Invalid value for Translatable string in `' +
				componentName +
				'`. Please pass a translate() call.'
		);
	}

	// assume all ok
	return null;
}

function createChainableTypeChecker( validate ) {
	function checkType( isRequired, props, propName, componentName, location ) {
		componentName = componentName || 'ANONYMOUS';
		if ( props[ propName ] == null ) {
			if ( isRequired ) {
				return new Error(
					'Required ' +
						location +
						' `' +
						propName +
						'` was not specified in ' +
						( '`' + componentName + '`.' )
				);
			}
			return null;
		}
		return validate( props, propName, componentName, location );
	}

	const chainedCheckType = checkType.bind( null, false );
	chainedCheckType.isRequired = checkType.bind( null, true );

	return chainedCheckType;
}

export default createChainableTypeChecker( translatableStringChecker );
