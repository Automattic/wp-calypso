export function loadScript(
	url: string,
	callback: ( () => void ) | undefined,
	args?: Record< string, string >
): undefined;
export function loadScript( url: string ): Promise< void >;

export function loadjQueryDependentScript(
	url: string,
	callback: ( () => void ) | undefined,
	args?: Record< string, string >
): undefined;
export function loadjQueryDependentScript( url: string ): Promise< void >;
