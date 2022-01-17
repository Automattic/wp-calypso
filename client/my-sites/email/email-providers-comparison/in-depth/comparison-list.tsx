/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import EmailProviderFeatures from 'calypso/my-sites/email/email-provider-features';
import EmailProviderPrice from 'calypso/my-sites/email/email-providers-comparison/in-depth/email-provider-price';
import LearnMoreLink from 'calypso/my-sites/email/email-providers-comparison/in-depth/learn-more-link';
import { ComparisonListOrTableProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

import './style.scss';

const ComparisonList = ( {
	emailProviders,
	intervalLength,
	onSelectEmailProvider,
	selectedDomainName,
}: ComparisonListOrTableProps ): ReactElement => {
	const translate = useTranslate();

	return (
		<div className="email-providers-in-depth-comparison-list">
			{ emailProviders.map( ( emailProviderFeatures ) => {
				const { importing, tools, storage, support } = emailProviderFeatures.list;

				return (
					<Card key={ emailProviderFeatures.slug }>
						<div className="email-providers-in-depth-comparison-table__provider">
							{ emailProviderFeatures.logo }

							<div className="email-providers-in-depth-comparison-table__provider-info">
								<h2>{ emailProviderFeatures.name }</h2>

								{ emailProviderFeatures.description }
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
							<EmailProviderFeatures features={ [ tools, storage, importing, support ] } />
						</div>

						<div className="email-providers-in-depth-comparison-list__support-link">
							<LearnMoreLink url={ emailProviderFeatures.supportUrl } />
						</div>

						{ emailProviderFeatures.badge && (
							<div className="email-providers-in-depth-comparison-list__badge">
								{ emailProviderFeatures.badge }
							</div>
						) }

						<Button
							className="email-providers-in-depth-comparison-list__button"
							onClick={ () => onSelectEmailProvider( emailProviderFeatures.slug ) }
							primary
						>
							{ translate( 'Select' ) }
						</Button>
					</Card>
				);
			} ) }
		</div>
	);
};

export default ComparisonList;
