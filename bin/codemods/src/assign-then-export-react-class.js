const { get } = require( 'lodash' );

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

const DEFAULT_EXPORT_NAME = '__CHANGE_ME__';

export default function transformer( file, api ) {
  const j = api.jscodeshift;

  const exportDefaultDeclaration = j( file.source )
    .find( j.ExportDefaultDeclaration, {
	   declaration: classIdentifier,
    } );

  const displayNamePaths = exportDefaultDeclaration.find( j.Property, displayNamePropertyIdentifier );
  const displayNameValue = displayNamePaths.length && displayNamePaths.at( 0 ).get( 'value' );
  const displayName = get( displayNameValue, 'value.value', DEFAULT_EXPORT_NAME );

  exportDefaultDeclaration.replaceWith( node => {
    const declaration = node.get( 'declaration' );

    return j.variableDeclaration( 'const', [
      j.variableDeclarator(
        j.identifier( displayName ),
        declaration.value
      )
    ] );
  } );

  exportDefaultDeclaration.insertAfter( 'export default ' + displayName + ';' );

  return exportDefaultDeclaration.toSource( {
    useTabs: true,
  } );
}
