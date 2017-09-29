/**
 * External dependencies
 */
const { get } = require( 'lodash' );

/**
 * Module variables
 */
const createClassIdentifier = {
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
	         declaration: createClassIdentifier,
        } );

    const displayNamePaths = exportDefaultDeclaration.find( j.Property, displayNamePropertyIdentifier );
    const displayNameValue = displayNamePaths.length && displayNamePaths.at( 0 ).get( 'value' );
    const displayName = get( displayNameValue, 'value.value', DEFAULT_EXPORT_NAME );

    exportDefaultDeclaration.replaceWith( node => (
        j.variableDeclaration( 'const', [
            j.variableDeclarator(
                j.identifier( displayName ),
                node.get( 'declaration' ).value
            )
        ] )
    ) );

    exportDefaultDeclaration.insertAfter( 'export default ' + displayName + ';' );

    return exportDefaultDeclaration.toSource( {
        useTabs: true,
    } );
}
