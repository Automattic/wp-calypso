export default function getPressableShortName( name: string ) {
	return name.replace( /(?:Pressable\s|[)(])/gi, '' );
}
