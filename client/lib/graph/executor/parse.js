/**
 * External dependencies
 */
import { parse, visit } from 'graphql';

export default ( queryString, variables ) => {
	const ast = parse( queryString );

	const parsed = visit( ast, {
		Document: { leave: node => node.definitions[ 0 ] },
		OperationDefinition: { leave: node => {
			return {
				variables: node.variableDefinitions,
				nodes: node.selectionSet
			};
		} },
		VariableDefinition: { leave: node => node.variable.name.value },
		SelectionSet: { leave: node => node.selections },
		Field: { leave: node => {
			return {
				name: node.name.value,
				nodes: node.selectionSet,
				arguments: node.arguments.reduce( ( memo, arg ) => {
					memo[ arg.name ] = arg.value;
					return memo;
				}, {} )
			};
		} },
		Argument: { leave: node => {
			const value = node.value && node.value.kind === 'Variable'
				? variables[ node.value.name.value ]
				: node.value;

			return {
				name: node.name.value,
				value
			};
		} },
		ObjectValue: { leave: node => {
			return node.fields.reduce( ( memo, field ) => {
				memo[ field.name ] = field.value;
				return memo;
			}, {} );
		} },
		ObjectField: { leave: node => {
			const value = node.value && node.value.kind === 'Variable'
				? variables[ node.value.name.value ]
				: node.value;
			return {
				name: node.name.value,
				value
			};
		} },
		StringValue: { leave: node => node.value },
		IntValue: { leave: node => parseInt( node.value ) },
	} );

	return parsed;
};
