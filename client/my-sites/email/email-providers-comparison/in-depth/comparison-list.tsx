/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Card } from '@automattic/components';
import EmailProviderFeatures from 'calypso/my-sites/email/email-provider-features';
import EmailProviderPrice from 'calypso/my-sites/email/email-providers-comparison/in-depth/email-provider-price';
import LearnMoreLink from 'calypso/my-sites/email/email-providers-comparison/in-depth/learn-more-link';
import SelectButton from 'calypso/my-sites/email/email-providers-comparison/in-depth/select-button';
import { ComparisonListOrTableProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

import './style.scss';

const ComparisonList = ( {
	emailProviders,
	intervalLength,
	isDomainInCart,
	onSelectEmailProvider,
	selectedDomainName,
}: ComparisonListOrTableProps ): ReactElement => {
	return (
		<div className="email-providers-in-depth-comparison-list">
			{ emailProviders.map( ( emailProviderFeatures ) => {
				const { collaboration, importing, tools, storage, support } = emailProviderFeatures.list;

				return (
					<Card key={ emailProviderFeatures.slug }>
						<div className="email-providers-in-depth-comparison-list__provider">
							{ emailProviderFeatures.logo }

							<div className="email-providers-in-depth-comparison-list__provider-info">
								<h2>{ emailProviderFeatures.name }</h2>

								<p>{ emailProviderFeatures.description }</p>
							</div>
						</div>

						<div className="email-providers-in-depth-comparison-list__price">
							<EmailProviderPrice
								emailProviderSlug={ emailProviderFeatures.slug }
								intervalLength={ intervalLength }
								selectedDomainName={ selectedDomainName }
							/>
						</div>

						<div className="email-providers-in-depth-comparison-list__features">
							<EmailProviderFeatures
								features={ [ tools, storage, collaboration, importing, support ] }
							/>
						</div>

						<div className="email-providers-in-depth-comparison-list__support-link">
							<LearnMoreLink url={ emailProviderFeatures.supportUrl } />
						</div>

						{ emailProviderFeatures.badge && (
							<div className="email-providers-in-depth-comparison-list__badge">
								{ emailProviderFeatures.badge }
							</div>
						) }

						<SelectButton
							className="email-providers-in-depth-comparison-list__button"
							emailProviderSlug={ emailProviderFeatures.slug }
							intervalLength={ intervalLength }
							isDomainInCart={ isDomainInCart }
							onSelectEmailProvider={ onSelectEmailProvider }
							selectedDomainName={ selectedDomainName }
						/>
					</Card>
				);
			} ) }
		</div>
	);
};

export default ComparisonList;
