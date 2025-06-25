const PlanDivOrTdContainer = (
	props: (
		| React.HTMLAttributes< HTMLDivElement >
		| React.HTMLAttributes< HTMLTableCellElement >
	) & { isTableCell?: boolean; scope?: string; isHeader?: boolean }
): JSX.Element => {
	const { children, isTableCell, isHeader, ...otherProps } = props;
	if ( isHeader ) {
		return <th { ...otherProps }>{ children }</th>;
	}
	return isTableCell ? (
		<td { ...otherProps }>{ children }</td>
	) : (
		<div { ...otherProps }>{ children }</div>
	);
};

export default PlanDivOrTdContainer;
