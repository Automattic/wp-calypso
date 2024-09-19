const PlanDivOrTdContainer = (
	props: (
		| React.HTMLAttributes< HTMLDivElement >
		| React.HTMLAttributes< HTMLTableCellElement >
	) & { isTableCell?: boolean; scope?: string }
): JSX.Element => {
	const { children, isTableCell, ...otherProps } = props;
	return isTableCell ? (
		<td { ...otherProps }>{ children }</td>
	) : (
		<div { ...otherProps }>{ children }</div>
	);
};

export default PlanDivOrTdContainer;
