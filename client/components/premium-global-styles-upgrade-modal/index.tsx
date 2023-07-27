import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';

import './style.scss';

export interface PremiumGlobalStylesUpgradeModalProps {
	description?: string | React.ReactNode;
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	tryStyle: () => void;
	/** Now we have 3 types of global styles including style variations, color variations, and font variations */
	numOfSelectedGlobalStyles?: number;
}

export default function PremiumGlobalStylesUpgradeModal( {
	description,
	checkout,
	closeModal,
	isOpen,
	tryStyle,
	numOfSelectedGlobalStyles = 1,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus();
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
		<strong>{ translate( 'Style customization' ) }</strong>,
		translate( 'Support via email' ),
		translate( 'Ad-free experience' ),
	];
	const displayFeatures = globalStylesInPersonalPlan ? personalFeatures : features;

	const featureList = (
		<div className="upgrade-modal__included">
			<h2>
				{ globalStylesInPersonalPlan
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
	);

	return (
		<>
			<QueryProductsList />
			<Dialog
				className={ classNames( 'upgrade-modal', 'premium-global-styles-upgrade-modal', {
					loading: isLoading,
				} ) }
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
										{ globalStylesInPersonalPlan
											? translate(
													'You’ve selected a custom style that will only be visible to visitors after upgrading to the Personal plan or higher.',
													'You’ve selected custom styles that will only be visible to visitors after upgrading to the Personal plan or higher.',
													{ count: numOfSelectedGlobalStyles }
											  )
											: translate(
													'You’ve selected a custom style that will only be visible to visitors after upgrading to the Premium plan or higher.',
													'You’ve selected custom styles that will only be visible to visitors after upgrading to the Premium plan or higher.',
													{ count: numOfSelectedGlobalStyles }
											  ) }
									</p>
									<p>
										{ translate(
											'Upgrade now to unlock your custom style and get access to tons of other features. Or you can decide later and try it out first.',
											'Upgrade now to unlock your custom styles and get access to tons of other features. Or you can decide later and try them out first.',
											{ count: numOfSelectedGlobalStyles }
										) }
									</p>
								</>
							) }
							{ featureList }
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
						<div className="upgrade-modal__col">{ featureList }</div>
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
