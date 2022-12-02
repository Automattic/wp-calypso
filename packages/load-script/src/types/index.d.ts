export function loadScript(
	url: string,
	callback: () => void,
	args?: Record< string, string >
): undefined;
export function loadScript( url: string ): Promise< void >;

export function loadjQueryDependentScript(
	url: string,
	callback: () => void,
	args?: Record< string, string >
): undefined;
export function loadjQueryDependentScript( url: string ): Promise< void >;
