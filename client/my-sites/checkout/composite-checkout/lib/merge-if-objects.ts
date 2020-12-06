export default function mergeIfObjects( obj1: unknown, obj2: unknown ): MergedObject {
	if ( typeof obj1 === 'object' && typeof obj2 === 'object' ) {
		return { ...obj1, ...obj2 };
	}
	return {};
}

type MergedObject = Record< string, unknown >;
