// Mastodon uploads at publish time, so the state machine is just two states:
// `staged` (file in memory, alt text editable) and `failed` (pre-flight
// rejection — bad MIME, oversized, decode failed). There is no `compressing`
// or `uploading` phase during compose; `uploadAllNow` fires uploads in
// parallel from `extendBuildParams` when the user clicks Post.
export type ComposerImage =
	| {
			kind: 'staged';
			localId: string;
			file: File;
			previewUrl: string;
			alt: string;
	  }
	| {
			kind: 'failed';
			localId: string;
			file: File;
			previewUrl: string;
			alt: string;
			reason: 'too_large' | 'unsupported_type' | 'decode_failed';
	  };
