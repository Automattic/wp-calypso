type SHA256 = {
	update( data: string ): SHA256;
	digest( encoding: 'hex' ): string;
};
declare module 'hash.js/lib/hash/sha/256' {
	export default function sha256(): SHA256;
}
