// @unstable: not present in core
export type RouteProps = {
	name: string;
	path: string;
	areas: Record< string, React.ComponentType >;
	widths?: Record< string, number >;
};
