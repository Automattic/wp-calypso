import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
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

	const featureNamesColumn = showFeatureNames && (
		<div id="empty-row" className="comparison-table__header-column-empty column-one row-one" />
	);

	const rowClassNames = [
		'row-one',
		'row-two',
		'row-three',
		'row-four',
		'row-five',
		'row-six',
		'row-seven',
		'row-eight',
		'row-nine',
		'row-ten',
	];
	const columnClassNames = [ 'column-one', 'column-two', 'column-three', 'column-four' ];

	const tableHeaderComponent = (
		<>
			{ featureNamesColumn }
			{ emailProviders.map( ( emailProviderFeature, index ) => {
				return (
					<div
						className={ classNames(
							columnClassNames[ index + 1 ],
							'row-one',
							'comparison-table__header-column',
							'cell'
						) }
						key={ `comparison-table__header-column-${ index }` }
					>
						{ logoComponentProvider( emailProviderFeature ) }
						<div className="comparison-table__header-container">
							<h1 className="comparison-table__header-title wp-brand-font">
								{ emailProviderFeature.header }
							</h1>
							<p className="comparison-table__header-subtitle">{ emailProviderFeature.subtitle }</p>
						</div>
					</div>
				);
			} ) }
		</>
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
		<>
			{ featuresColumn.map( ( feature, row ) => {
				return (
					<>
						<div className={ classNames( 'column-one', rowClassNames[ row + 1 ], 'cell' ) }>
							{ feature.name } { feature.popover }
						</div>
						{ emailProviders.map( ( emailProviderFeature, column ) => {
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
								<>
									<div
										className={ classNames(
											rowClassNames[ row + 1 ],
											columnClassNames[ column + 1 ],
											'cell'
										) }
										key={ `comparison-table__feature-description-${ column }-${ row }` }
									>
										{ providerFeature && feature.wrapper
											? feature.wrapper(
													feature.description,
													emailProviderFeature.learnMore ?? undefined
											  )
											: featureProp }
									</div>
									<div
										className={ classNames( 'comparison-table__line', rowClassNames[ row + 1 ] ) }
									/>
								</>
							);
						} ) }
					</>
				);
			} ) }
			{ showCallbackRow && (
				<>
					<div
						className={ classNames(
							'comparison-table__select',
							'column-one',
							'cell',
							rowClassNames[ featuresColumn.length + 1],
							'cell'
						) }
					/>
					{ emailProviders.map( ( provider, column ) => {
						return (
							<div
								className={ classNames(
									'comparison-table__feature-description',
									'comparison-table__select',
									columnClassNames[ column + 1 ],
									rowClassNames[ featuresColumn.length + 1],
									'cell'
								) }
							>
								<FullWidthButton primary onClick={ provider.selectCallback }>
									{ translate( 'Select' ) }
								</FullWidthButton>
							</div>
						);
					} ) }
				</>
			) }
		</>
	);

	const tableComponent = (
		<div className="comparison-table__table">
			{ tableHeaderComponent }
			{ tableBodyComponent }
		</div>
	);

	return (
		<Main wideLayout className={ classNames( className, 'comparison-table__main' ) }>
			{ tableComponent }
		</Main>
	);
};

export default ComparisonTable;
