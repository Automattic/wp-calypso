const postcss = require( 'postcss' );

module.exports = postcss.plugin( 'postcss-test-plugin', function( options ) {
	return function( root ) {
		root.walkRules( ( rule ) => {
			const themeDecls = {};
			let hasThemeDecls = false;
			rule.walkDecls( ( decl ) => {
				const themeMatch = /(theme\(([^\)]*)\))/g;
				if ( ! decl.value ) {
					return;
				}
				const matched = decl.value.match( themeMatch );
				if ( ! matched ) {
					return;
				}
				let value = decl.value;
				let parsed;
				const themeValues = {};
				while ( ( parsed = themeMatch.exec( decl.value ) ) !== null ) {
					const [ , whole, color ] = parsed;
					const colorKey = color.trim();
					const defaultColor = options.defaults[ colorKey ];
					value = value.replace( whole, defaultColor );

					Object.entries( options.themes ).forEach( ( [ key, colors ] ) => {
						const previousValue = themeValues[ key ] ? themeValues[ key ] : decl.value;
						themeValues[ key ] = previousValue.replace( whole, colors[ colorKey ] );
					} );
				}

				hasThemeDecls = true;
				decl.value = value;
				Object.keys( options.themes ).forEach( ( key ) => {
					const themeDecl = decl.clone();
					themeDecl.value = themeValues[ key ];
					if ( ! themeDecls[ key ] ) {
						themeDecls[ key ] = [];
					}
					themeDecls[ key ].push( themeDecl );
				} );
			} );

			if ( hasThemeDecls ) {
				Object.keys( options.themes ).forEach( ( key ) => {
					const newRule = postcss.rule( {
						selector: rule.selector.split( ',' ).map(
							( subselector ) => 'body.' + key + ' ' + subselector.trim()
						).join( ', ' ),
					} );
					themeDecls[ key ].forEach( ( decl ) => newRule.append( decl ) );
					rule.parent.insertAfter( rule, newRule );
				} );
			}
		} );
	};
} );
