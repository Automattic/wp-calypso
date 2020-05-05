function translatableStringChecker( props, propName, componentName ) {
	componentName = componentName || 'ANONYMOUS';

	const value = props[ propName ];
	if ( value !== undefined && value !== null ) {
		if ( 'string' === typeof value ) {
			return null;
		}

		// Translator Jumpstart old-style
		if ( 'object' === typeof value && 'data' === value.type ) {
			return null;
		}

		// Translator Jumpstart after #21591
		if (
			'object' === typeof value &&
			'function' === typeof value.type &&
			( 'Translatable' === value.type.name ||
				// Accept HOC wrappings (e.g. `localize( Translatable )`)
				String( value.type.displayName ).match( /\(Translatable\)/ ) )
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
		if ( props[ propName ] === undefined ) {
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
