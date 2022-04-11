/* eslint-disable wpcalypso/jsx-classname-namespace */

import { useTranslate } from 'i18n-calypso';
import EmailProviderPrice from 'calypso/my-sites/email/email-providers-comparison/in-depth/email-provider-price';
import LearnMoreLink from 'calypso/my-sites/email/email-providers-comparison/in-depth/learn-more-link';
import SelectButton from 'calypso/my-sites/email/email-providers-comparison/in-depth/select-button';
import type { ComparisonListOrTableProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

import './style.scss';

const ComparisonTable = ( {
	emailProviders,
	intervalLength,
	isDomainInCart,
	onSelectEmailProvider,
	selectedDomainName,
}: ComparisonListOrTableProps ): ReactElement => {
	const translate = useTranslate();

	return (
		<table className="email-providers-in-depth-comparison-table">
			<tbody>
				<tr>
					<td></td>

					{ emailProviders.map( ( emailProviderFeatures ) => {
						return (
							<td key={ emailProviderFeatures.slug }>
								<div className="email-providers-in-depth-comparison-table__provider">
									{ emailProviderFeatures.logo }

									<div className="email-providers-in-depth-comparison-table__provider-info">
										<h2>{ emailProviderFeatures.name }</h2>

										<p>{ emailProviderFeatures.description }</p>
									</div>
								</div>
							</td>
						);
					} ) }
				</tr>

				<tr>
					<td></td>

					{ emailProviders.map( ( emailProviderFeatures ) => {
						return (
							<td key={ emailProviderFeatures.slug }>
								<EmailProviderPrice
									emailProviderSlug={ emailProviderFeatures.slug }
									intervalLength={ intervalLength }
									selectedDomainName={ selectedDomainName }
								/>
							</td>
						);
					} ) }
				</tr>

				<tr>
					<td className="email-providers-in-depth-comparison-table__feature">
						{ translate( 'Tools' ) }
					</td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>{ emailProviderFeatures.table.tools }</td>
					) ) }
				</tr>

				<tr className="email-providers-in-depth-comparison-table__separator">
					<td className="email-providers-in-depth-comparison-table__feature">
						{ translate( 'Storage' ) }
					</td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>{ emailProviderFeatures.table.storage }</td>
					) ) }
				</tr>

				<tr className="email-providers-in-depth-comparison-table__separator">
					<td className="email-providers-in-depth-comparison-table__feature">
						{ translate( 'Collaboration' ) }
					</td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>
							{ emailProviderFeatures.table.collaboration }
						</td>
					) ) }
				</tr>

				<tr className="email-providers-in-depth-comparison-table__separator">
					<td className="email-providers-in-depth-comparison-table__feature">
						{ translate( 'Importing' ) }
					</td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>{ emailProviderFeatures.table.importing }</td>
					) ) }
				</tr>

				<tr className="email-providers-in-depth-comparison-table__separator">
					<td className="email-providers-in-depth-comparison-table__feature">
						{ translate( 'Support' ) }
					</td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>{ emailProviderFeatures.table.support }</td>
					) ) }
				</tr>

				<tr>
					<td></td>

					{ emailProviders.map( ( emailProviderFeatures ) => (
						<td key={ emailProviderFeatures.slug }>
							<LearnMoreLink url={ emailProviderFeatures.supportUrl } />
						</td>
					) ) }
				</tr>

				<tr>
					<td></td>

					{ emailProviders.map( ( emailProviderFeatures ) => {
						return <td key={ emailProviderFeatures.slug }>{ emailProviderFeatures.badge }</td>;
					} ) }
				</tr>

				<tr>
					<td></td>

					{ emailProviders.map( ( emailProviderFeatures ) => {
						return (
							<td key={ emailProviderFeatures.slug }>
								<SelectButton
									className="email-providers-in-depth-comparison-table__button"
									emailProviderSlug={ emailProviderFeatures.slug }
									intervalLength={ intervalLength }
									isDomainInCart={ isDomainInCart }
									onSelectEmailProvider={ onSelectEmailProvider }
									selectedDomainName={ selectedDomainName }
								/>
							</td>
						);
					} ) }
				</tr>
			</tbody>
		</table>
	);
};

export default ComparisonTable;
