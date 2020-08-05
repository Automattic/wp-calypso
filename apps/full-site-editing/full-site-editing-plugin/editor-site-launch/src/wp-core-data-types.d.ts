declare module '@wordpress/core-data' {
	export const EntityProvider: React.ComponentType;
	export const useEntityProp: (
		kind: string,
		type: string,
		prop: string
	) => [ string, ( newValue: string ) => void ];
}
