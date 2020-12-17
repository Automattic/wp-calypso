export default function mergeIfObjects( ...objects: unknown[] ): MergedObject {
	return objects.reduce( ( merged: MergedObject, obj: unknown ): MergedObject => {
		if ( typeof obj !== 'object' ) {
			return merged;
		}
		return { ...merged, ...obj };
	}, {} );
}

type MergedObject = Record< string, unknown >;
