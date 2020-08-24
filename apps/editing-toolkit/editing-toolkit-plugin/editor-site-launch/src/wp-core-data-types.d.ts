declare module '@wordpress/core-data' {
	export const EntityProvider: React.ComponentType< any >;
	export const useEntityProp: (
		kind: string,
		type: string,
		prop: string
	) => [ string, ( newValue: string ) => void ];
}
