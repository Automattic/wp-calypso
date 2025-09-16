import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { isMonthlyOrFreeFlow } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import StepWrapper from 'calypso/signup/step-wrapper';

export type StepProps = {
	stepSectionName: string | null;
	stepName: string;
	flowName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	submitSignupStep: ( step: unknown, dependencies: unknown ) => void;
	queryObject: Record< string, string | undefined >;
};

export default function DomainSearchStep( props: StepProps ) {
	const allowedTlds = props.queryObject.tld?.split( ',' ) ?? [];

	const getContent = () => {
		return (
			<WPCOMDomainSearch
				flowName={ props.flowName }
				config={ {
					vendor: getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: props.flowName === 'domain',
						flowName: props.flowName,
					} ),
					priceRules: {
						forceRegularPrice: isMonthlyOrFreeFlow( props.flowName ),
					},
					allowedTlds,
				} }
			/>
		);
	};

	return (
		<StepWrapper
			headerText="Domain Search"
			subHeaderText="Domain Search"
			stepContent={ getContent() }
			{ ...props }
		/>
	);
}
