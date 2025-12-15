/**
 * Global type declarations for the Agents Manager package.
 */

/**
 * agentsManagerData is set as a global const via wp_add_inline_script
 * in Jetpack's Agents Manager feature.
 */
declare const agentsManagerData:
	| {
			agentProviders?: string[];
			useUnifiedExperience?: boolean;
	  }
	| undefined;
