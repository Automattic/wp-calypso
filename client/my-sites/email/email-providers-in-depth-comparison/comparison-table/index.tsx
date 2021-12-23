import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import Main from 'calypso/components/main';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

export type EmailProviderFeatures = {
	id: string;
	header: string;
	headerLogo: string;
	headerLogoIsGridIcon?: boolean;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	selectCallback?: () => void;
	subtitle: TranslateResult;
	support: TranslateResult;
	footerBadge?: string;
	learnMore: string | null;
};

type ComparisonTableProps = {
	className: string;
	emailProviders: EmailProviderFeatures[];
	showFeatureNames?: boolean;
};

const ComparisonTable: FunctionComponent< ComparisonTableProps > = ( {
	className,
	emailProviders,
	showFeatureNames = true,
} ) => {
	const showCallbackRow = emailProviders.some( ( provider ) => provider.selectCallback );
	const logoComponentProvider = ( provider: EmailProviderFeatures ) =>
		provider.headerLogoIsGridIcon ? (
			<Gridicon className="comparison-table__header-logo" icon={ provider.headerLogo } />
		) : (
			<img
				alt={ provider.header }
				src={ provider.headerLogo }
				className="comparison-table__header-logo"
			/>
		);

	const tableHeaderComponent = (
		<thead>
			<tr className="comparison-table__header-row">
				{ showFeatureNames && (
					<th id="empty-row" className="comparison-table__header-column-empty" />
				) }
				{ emailProviders.map( ( emailProviderFeature, index ) => {
					return (
						<th
							id={ emailProviderFeature.id }
							className="comparison-table__header-column"
							key={ `comparison-table__header-column-${ index }` }
						>
							<div className="comparison-table__header">
								{ logoComponentProvider( emailProviderFeature ) }
								<div className="comparison-table__header-container">
									<h1 className="comparison-table__header-title wp-brand-font">
										{ emailProviderFeature.header }
									</h1>
									<p className="comparison-table__header-subtitle">
										{ emailProviderFeature.subtitle }
									</p>
								</div>
							</div>
						</th>
					);
				} ) }
			</tr>
		</thead>
	);

	const featuresColumn = [
		{
			name: translate( 'Tools' ),
			key: 'tools',
			popover: (
				<InfoPopover position="right" showOnHover>
					Placeholder
				</InfoPopover>
			),
		},
		{
			name: translate( 'Storage' ),
			key: 'storage',
			popover: (
				<InfoPopover position="right" showOnHover>
					Placeholder
				</InfoPopover>
			),
		},
		{
			name: translate( 'Importing' ),
			key: 'importing',
			popover: (
				<InfoPopover position="right" showOnHover>
					Placeholder
				</InfoPopover>
			),
		},
		{
			name: translate( 'Support' ),
			key: 'support',
			popover: (
				<InfoPopover position="right" showOnHover>
					Placeholder
				</InfoPopover>
			),
		},
		{
			wrapper: ( content: string, href = '' ) => (
				<a href={ href } className="comparison-table__learn-more">
					{ content }
				</a>
			),
			key: 'learnMore',
			description: translate( 'Learn more', { textOnly: true } ),
			popover: null,
		},
		{
			key: 'footerBadge',
		},
	];

	const tableBodyComponent = (
		<tbody>
			{ featuresColumn.map( ( feature, index ) => {
				return (
					<tr
						className="comparison-table__body-row"
						key={ `comparison-table__body-row-${ index }` }
					>
						{ showFeatureNames && (
							<td className="comparison-table__feature-name" headers="empty-row">
								{ feature.name } { feature.popover }
							</td>
						) }
						{ emailProviders.map( ( emailProviderFeature, index ) => {
							const providerFeature =
								emailProviderFeature[ feature.key as keyof EmailProviderFeatures ];

							const featureProp =
								providerFeature && feature.key === 'footerBadge' ? (
									<img
										src={ emailProviderFeature[ feature.key ] }
										alt={ emailProviderFeature.header }
									/>
								) : (
									providerFeature
								);
							return (
								<td
									className="comparison-table__feature-description"
									headers={ emailProviderFeature.id }
									key={ `comparison-table__feature-description-${ index }` }
								>
									{ providerFeature && feature.wrapper
										? feature.wrapper(
												feature.description,
												emailProviderFeature.learnMore ?? undefined
										  )
										: featureProp }
								</td>
							);
						} ) }
					</tr>
				);
			} ) }
			{ showCallbackRow && (
				<tr className="comparison-table__select">
					<td className="comparison-table__select" headers="empty-row" />
					{ emailProviders.map( ( provider ) => {
						return (
							<td
								className="comparison-table__feature-description comparison-table__select"
								headers={ provider.id }
							>
								<FullWidthButton primary onClick={ provider.selectCallback }>
									{ translate( 'Select' ) }
								</FullWidthButton>
							</td>
						);
					} ) }
				</tr>
			) }
		</tbody>
	);

	const tableComponent = (
		<table className="comparison-table__table">
			{ tableHeaderComponent }
			{ tableBodyComponent }
		</table>
	);

	return (
		<Main wideLayout className={ classnames( className, 'comparison-table__main' ) }>
			{ tableComponent }
		</Main>
	);
};

export default ComparisonTable;
