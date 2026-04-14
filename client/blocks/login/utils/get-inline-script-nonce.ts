type WindowWithInlineScriptNonce = Window & {
	inlineScriptNonce?: string;
};

export function getInlineScriptNonce(): string | undefined {
	return ( window as WindowWithInlineScriptNonce ).inlineScriptNonce;
}
