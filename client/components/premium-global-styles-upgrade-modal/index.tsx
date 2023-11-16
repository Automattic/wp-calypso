import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import useGlobalStylesUpgradeTranslations from './use-global-styles-upgrade-translations';
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
	const translations = useGlobalStylesUpgradeTranslations( { numOfSelectedGlobalStyles } );
	const isLoading = ! premiumPlanProduct;

	const featureList = (
		<div className="upgrade-modal__included">
			<h2>{ translations.featuresTitle }</h2>
			<ul>
				{ translations.features.map( ( feature, i ) => (
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
							<h1 className="upgrade-modal__heading">{ translate( 'Unlock premium styles' ) }</h1>
							{ description ?? (
								<>
									<p>{ translations.description }</p>
									<p>{ translations.promotion }</p>
								</>
							) }
							{ featureList }
							<div className="upgrade-modal__actions bundle">
								<Button className="upgrade-modal__cancel" onClick={ () => tryStyle() }>
									{ translations.cancel }
								</Button>
								<Button
									className="upgrade-modal__upgrade-plan"
									primary
									onClick={ () => checkout() }
								>
									{ translations.upgrade }
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
