/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { Tooltip } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import Badge from '../../../components/badge';
import MShotsImage from '../../../components/mshots-image';
import availableDesigns, {
	getDesignImageUrl,
	getDesignUrl,
	mShotOptions,
} from '../../../available-designs';
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import type { Design } from '../../../stores/onboard/types';

/**
 * Style dependencies
 */
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-grid__option-name__${ slug }`;

interface Props {
	designs?: Design[];
	isGridMinimal?: boolean;
	locale: string;
	onSelect: ( design: Design ) => void;
}

const DesignSelector: React.FunctionComponent< Props > = ( {
	designs = ( availableDesigns?.featured as unknown ) as Design[],
	isGridMinimal,
	locale,
	onSelect,
} ) => {
	const { __ } = useI18n();

	return (
		<div className="design-grid">
			<div className={ isGridMinimal ? 'design-grid__grid-minimal' : 'design-grid__grid' }>
				{ designs?.map( ( design ) => (
					<button
						key={ design.slug }
						className="design-grid__design-option"
						data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
						onClick={ () => onSelect( design ) }
					>
						<span
							className={ classnames(
								'design-grid__image-frame',
								isEnabled( 'gutenboarding/landscape-preview' )
									? 'design-grid__landscape'
									: 'design-grid__portrait',
								design.preview === 'static' ? 'design-grid__static' : 'design-grid__scrollable'
							) }
						>
							{ isEnabled( 'gutenboarding/mshot-preview' ) ? (
								<MShotsImage
									url={ getDesignUrl( design, locale ) }
									aria-labelledby={ makeOptionId( design ) }
									alt=""
									options={ mShotOptions() }
								/>
							) : (
								<img
									alt=""
									aria-labelledby={ makeOptionId( design ) }
									src={ getDesignImageUrl( design ) }
								/>
							) }
						</span>
						<span className="design-grid__option-overlay">
							<span id={ makeOptionId( design ) } className="design-grid__option-meta">
								<span className="design-grid__option-name">{ design.title }</span>
								{ design.is_premium && (
									<Tooltip
										position="bottom center"
										text={ __( 'Requires a Personal plan or above' ) }
									>
										<div className="design-grid__premium-container">
											<Badge className="design-grid__premium-badge">
												<JetpackLogo className="design-grid__premium-badge-logo" size={ 20 } />
												<span className="design-grid__premium-badge-text">{ __( 'Premium' ) }</span>
											</Badge>
										</div>
									</Tooltip>
								) }
							</span>
						</span>
					</button>
				) ) }
			</div>
		</div>
	);
};

export default DesignSelector;
