import { useDomainSuggestionContainer } from '@automattic/domain-search';
import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import freeDomainForAYearPromoImage from './graphic.svg';

import './style.scss';

export const FreeDomainForAYearPromo = ( { textOnly = false } ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const { __ } = useI18n();

	if ( textOnly ) {
		return (
			<Text>
				{ __( 'Get your free domain when you check out and purchase any paid annual plan.' ) }
			</Text>
		);
	}

	const title = __( 'Claim your first domain—Free!' );

	const subtitle = createInterpolateElement(
		__(
			"Choose a domain, then purchase an annual plan, and your first year's domain registration is on us!<br />Discount automatically applied at checkout."
		),
		{
			br: <br />,
		}
	);

	return (
		<Card ref={ containerRef } size="small" className="free-domain-for-a-year-promo">
			<CardBody className="free-domain-for-a-year-promo__body">
				<HStack spacing={ 6 } alignment="left">
					{ activeQuery === 'large' && (
						<img
							src={ freeDomainForAYearPromoImage }
							alt=""
							aria-hidden="true"
							className="free-domain-for-a-year-promo__image"
						/>
					) }
					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ title }</Text>
						<Text>{ subtitle }</Text>
					</VStack>
				</HStack>
			</CardBody>
		</Card>
	);
};
