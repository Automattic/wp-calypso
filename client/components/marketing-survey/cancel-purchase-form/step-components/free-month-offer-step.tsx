import { getPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { FunctionComponent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

interface Props {
	productSlug: string;
}

const FreeMonthOfferStep: FunctionComponent< Props > = ( { productSlug } ) => {
	const translate = useTranslate();

	return (
		<div className="free-month-offer-step">
			<FormSectionHeading className="free-month-offer-step__heading">
				{ translate( 'How about a free month?', {
					comment:
						'Title of a nudge that offers a free month to those who are canceling their current subscription.',
				} ) }
			</FormSectionHeading>
			<FormFieldset>
				<p>
					{ translate(
						'Need more time? Enjoy a month of your %(planName)s subscription for free and continue building on your site.',
						{ args: { planName: getPlan( productSlug )?.getTitle() } }
					) }
				</p>
			</FormFieldset>
		</div>
	);
};

FreeMonthOfferStep.propTypes = {
	productSlug: PropTypes.string.isRequired,
};

export default FreeMonthOfferStep;
