const classIdentifier = {
  type: 'CallExpression',
  callee: {
    type: 'MemberExpression',
    object: {
      name: 'React',
    },
    property: {
      name: 'createClass',
    }
  },
};

const displayNamePropertyIdentifier = {
  key: {
    name: 'displayName',
  },
};

export default function transformer( file, api ) {
  const j = api.jscodeshift;

  const exportDefaultDeclaration = j( file.source )
    .find( j.ExportDefaultDeclaration, {
	   declaration: classIdentifier,
    } );

  const displayNamePath = exportDefaultDeclaration.find( j.Property, displayNamePropertyIdentifier ).at( 0 );
  const displayNameValue = displayNamePath.get( 'value' ).value.value;

  exportDefaultDeclaration.replaceWith( node => {
    const declaration = node.get( 'declaration' );

    return j.variableDeclaration( 'const', [
      j.variableDeclarator(
        j.identifier( displayNameValue ),
        declaration.value
      )
    ] );
  } );

  exportDefaultDeclaration.insertAfter( 'export default ' + displayNameValue + ';' );

  return exportDefaultDeclaration.toSource( {
    useTabs: true,
  } );
}
