import config from '@automattic/calypso-config';

/**
 * This hook is used to determine if the domain search redesign is enabled for a given flow.
 * It should NOT be used within components, only at top level pages.
 */
export const useIsDomainSearchV2Enabled = () => {
	return config.isEnabled( 'domains/ui-redesign' );
};
