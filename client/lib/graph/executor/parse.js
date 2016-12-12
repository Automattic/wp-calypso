/**
 * External dependencies
 */
import { parse, visit } from 'graphql';

export default ( queryString, variables ) => {
	const ast = parse( queryString );

	const parsed = visit( ast, {
		Document: { leave: node => node.definitions[ 0 ] },
		OperationDefinition: { leave: node => {
			return {
				nodes: node.selectionSet
			};
		} },
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
			return {
				name: node.name.value,
				value: node.value
			};
		} },
		Variable: { leave: node => variables[ node.name.value ] },
		ObjectValue: { leave: node => {
			return node.fields.reduce( ( memo, field ) => {
				memo[ field.name ] = field.value;
				return memo;
			}, {} );
		} },
		ObjectField: { leave: node => {
			return {
				name: node.name.value,
				value: node.value
			};
		} },
		StringValue: { leave: node => node.value },
		IntValue: { leave: node => parseInt( node.value, 10 ) },
		BooleanValue: { leave: node => node.value },
		NullValue: { leave: () => null },
		FloatValue: { leave: node => parseFloat( node.value ) },
		ListValue: { leave: node => node.values },
	} );

	return parsed;
};
