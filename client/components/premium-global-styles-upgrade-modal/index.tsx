import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

import './style.scss';

export interface PremiumGlobalStylesUpgradeModalProps {
	description?: string | React.ReactNode;
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	tryStyle: () => void;
}

export default function PremiumGlobalStylesUpgradeModal( {
	description,
	checkout,
	closeModal,
	isOpen,
	tryStyle,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const [ , experiment ] = useExperiment( 'calypso_global_styles_personal' );
	const globalStylesOnPersonalExperiment = experiment?.variationName === 'treatment';
	const isLoading = ! premiumPlanProduct;
	const features = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		<strong>{ translate( 'Premium themes' ) }</strong>,
		translate( 'Style customization' ),
		translate( 'Live chat support' ),
		translate( 'Ad-free experience' ),
		translate( 'Earn with WordAds' ),
	];
	const personalFeatures = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		translate( 'Style customization' ),
		translate( 'Live chat support' ),
		translate( 'Ad-free experience' ),
	];
	const displayFeatures = globalStylesOnPersonalExperiment ? personalFeatures : features;

	return (
		<>
			<QueryProductsList />
			<Dialog
				className={ classNames( 'upgrade-modal', { loading: isLoading } ) }
				isFullScreen
				isVisible={ isOpen }
				onClose={ () => closeModal() }
			>
				{ isLoading && <LoadingEllipsis /> }
				{ ! isLoading && (
					<>
						<div className="upgrade-modal__col">
							<h1 className="upgrade-modal__heading">{ translate( 'Unlock custom styles' ) }</h1>
							{ description ?? (
								<>
									<p>
										{ globalStylesOnPersonalExperiment
											? translate(
													"You've selected a custom style that will only be visible to visitors after upgrading to the Personal plan or higher."
											  )
											: translate(
													"You've selected a custom style that will only be visible to visitors after upgrading to the Premium plan or higher."
											  ) }
									</p>
									<p>
										{ translate(
											'Upgrade now to unlock your custom style and get access to tons of other features. Or you can decide later and try it out first.'
										) }
									</p>
								</>
							) }
							<div className="upgrade-modal__actions bundle">
								<Button className="upgrade-modal__cancel" onClick={ () => tryStyle() }>
									{ translate( 'Decide later' ) }
								</Button>
								<Button
									className="upgrade-modal__upgrade-plan"
									primary
									onClick={ () => checkout() }
								>
									{ translate( 'Upgrade plan' ) }
								</Button>
							</div>
						</div>
						<div className="upgrade-modal__col">
							<div className="upgrade-modal__included">
								<h2>
									{ globalStylesOnPersonalExperiment
										? translate( 'Included with your Personal plan' )
										: translate( 'Included with your Premium plan' ) }
								</h2>
								<ul>
									{ displayFeatures.map( ( feature, i ) => (
										<li key={ i } className="upgrade-modal__included-item">
											<Gridicon icon="checkmark" size={ 16 } />
											{ feature }
										</li>
									) ) }
								</ul>
							</div>
						</div>
						<Button className="upgrade-modal__close" borderless onClick={ () => closeModal() }>
							<Gridicon icon="cross" size={ 12 } />
							<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
						</Button>
					</>
				) }
			</Dialog>
		</>
	);
}
