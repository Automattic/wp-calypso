import { useSearchParams } from 'react-router-dom';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';

interface Props {
	siteID?: number | string;
	hasColor: boolean;
	hasFont: boolean;
}

const useCustomStyles = ( { siteID = 0, hasColor, hasFont }: Props ) => {
	const [ searchParams, setSearchParams ] = useSearchParams();

	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteID );

	const numOfSelectedGlobalStyles = [ hasColor, hasFont ].filter( Boolean ).length;

	const resetCustomStyles = !! searchParams.get( 'reset_custom_styles' );

	const setResetCustomStyles = ( value: boolean ) => {
		setSearchParams(
			( currentSearchParams ) => {
				if ( value ) {
					currentSearchParams.set( 'reset_custom_styles', String( value ) );
				} else {
					currentSearchParams.delete( 'reset_custom_styles' );
				}
				return currentSearchParams;
			},
			{ replace: true }
		);
	};

	return {
		shouldUnlockGlobalStyles: numOfSelectedGlobalStyles > 0 && shouldLimitGlobalStyles,
		numOfSelectedGlobalStyles,
		resetCustomStyles,
		setResetCustomStyles,
	};
};

export default useCustomStyles;
