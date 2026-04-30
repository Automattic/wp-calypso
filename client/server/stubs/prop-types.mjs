// Server-side stub for prop-types. Validators are dev-only console.warns,
// never needed during SSR.
const v = () => null;
v.isRequired = v;
const t = () => {
	const _v = () => null;
	_v.isRequired = _v;
	return _v;
};
const PT = {
	array: v, bool: v, func: v, number: v, object: v, string: v, symbol: v,
	any: v, node: v, element: v, elementType: v,
	instanceOf: t, oneOf: t, oneOfType: t, arrayOf: t, objectOf: t, shape: t, exact: t,
	checkPropTypes: () => {}, resetWarningCache: () => {},
};
export default PT;
export const {
	array, bool, func, number, object, string, symbol,
	any, node, element, elementType, instanceOf, oneOf, oneOfType,
	arrayOf, objectOf, shape, exact, checkPropTypes, resetWarningCache,
} = PT;
