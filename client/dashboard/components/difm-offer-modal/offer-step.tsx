import { DotcomPlans } from '@automattic/api-core';
import {
	Button,
	ExternalLink,
	RadioControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { ButtonStack } from '../button-stack';
import ComponentViewTracker from '../component-view-tracker';
import { Text } from '../text';

export type DifmOfferTerm = '1y' | '2y' | '3y';

// The offer needs a Business plan billed yearly or longer, so there is no monthly term.
export const DIFM_OFFER_TERM_PRODUCT_SLUGS: Record< DifmOfferTerm, string > = {
	'1y': DotcomPlans.BUSINESS,
	'2y': DotcomPlans.BUSINESS_2_YEARS,
	'3y': DotcomPlans.BUSINESS_3_YEARS,
};

const DIFM_OFFER_FAQ_URL = 'https://difmrequest.com/faq/';

export function OfferStep( {
	term,
	tracksProps,
	onTermChange,
	onContinue,
}: {
	term: DifmOfferTerm;
	tracksProps: Record< string, unknown >;
	onTermChange: ( term: DifmOfferTerm ) => void;
	onContinue: () => void;
} ) {
	return (
		<VStack spacing={ 6 }>
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_impression"
				properties={ tracksProps }
			/>
			<VStack spacing={ 3 }>
				<HStack justify="flex-start">
					<Badge intent="high">{ __( 'Save $499' ) }</Badge>
				</HStack>
				<Text>
					{ __(
						'Get a Business plan and our experts will build your site for free. This offer is available for a limited time.'
					) }
				</Text>
				<Text variant="muted">{ __( '14-day money-back guarantee.' ) }</Text>
				<ExternalLink href={ DIFM_OFFER_FAQ_URL }>{ __( 'Learn more' ) }</ExternalLink>
			</VStack>
			{ /* Trustpilot review cards go here (DOTCOM-18833). */ }
			<RadioControl
				label={ __( 'Business plan billing' ) }
				selected={ term }
				onChange={ ( value: string ) => onTermChange( value as DifmOfferTerm ) }
				options={ [
					{ label: __( '1 year' ), value: '1y' },
					{ label: __( '2 years' ), value: '2y' },
					{ label: __( '3 years' ), value: '3y' },
				] }
			/>
			<ButtonStack justify="flex-end">
				<Button variant="primary" __next40pxDefaultSize onClick={ onContinue }>
					{ __( 'Continue' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
