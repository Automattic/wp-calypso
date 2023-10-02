import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';

interface Props {
	siteID?: number | string;
	hasColor: boolean;
	hasFont: boolean;
}

const useCustomStyles = ( { siteID = 0, hasColor, hasFont }: Props ) => {
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteID );
	const numOfSelectedGlobalStyles = [ hasColor, hasFont ].filter( Boolean ).length;

	return {
		shouldUnlockGlobalStyles: numOfSelectedGlobalStyles > 0 && shouldLimitGlobalStyles,
		numOfSelectedGlobalStyles,
	};
};

export default useCustomStyles;
