import { isEnabled } from '@automattic/calypso-config';
import { GlobalStylesProvider } from '@automattic/global-styles';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../../../../stores';
import StepperLoader from '../../components/stepper-loader';

const withGlobalStylesProvider = createHigherOrderComponent(
	< OuterProps, >( InnerComponent: React.ComponentType< OuterProps > ) => {
		return ( props: OuterProps ) => {
			const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
			const siteSlug = useSiteSlugParam();
			const siteId = useSiteIdParam();
			const siteSlugOrId = siteSlug ? siteSlug : siteId;
			const stylesheet = selectedDesign?.recipe?.stylesheet;

			if ( ! siteSlugOrId || ! stylesheet ) {
				return <StepperLoader />;
			}

			if ( ! isEnabled( 'pattern-assembler/color-and-fonts' ) ) {
				return <InnerComponent { ...props } />;
			}

			// TODO: We might need to lazy load the GlobalStylesProvider
			return (
				<GlobalStylesProvider
					siteId={ siteSlugOrId }
					stylesheet={ stylesheet }
					placeholder={ <StepperLoader /> }
				>
					<InnerComponent { ...props } />
				</GlobalStylesProvider>
			);
		};
	},
	'withGlobalStylesProvider'
);

export default withGlobalStylesProvider;
