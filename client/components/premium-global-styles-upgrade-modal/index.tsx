import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

import './style.scss';

export interface PremiumGlobalStylesUpgradeModalProps {
	customizeDescription?: ( description: React.ReactChild ) => JSX.Element;
	tryItOutText?: string;
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	tryStyle: () => void;
}

export default function PremiumGlobalStylesUpgradeModal( {
	tryItOutText,
	customizeDescription = ( description ) => <p>{ description }</p>,
	checkout,
	closeModal,
	isOpen,
	tryStyle,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const isLoading = ! premiumPlanProduct;

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
							<h1 className="upgrade-modal__heading">{ translate( 'Unlock this style' ) }</h1>
							{ customizeDescription(
								translate(
									'Get access to all theme styles, fonts, colors, and tons of other features by upgrading to {{strong}}%s{{/strong}}.',
									{
										components: {
											strong: <strong />,
										},
										args: premiumPlanProduct?.product_name,
										comment:
											'The variable is the plan name: "...by upgrading to WordPress.com Premium."',
									}
								)
							) }
							<div className="upgrade-modal__actions bundle">
								<Button className="upgrade-modal__cancel" onClick={ () => tryStyle() }>
									{ tryItOutText ?? translate( 'Try it out first' ) }
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
								<h2>{ translate( 'Included with your Premium plan' ) }</h2>
								<ul>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										<strong>{ translate( 'Access all theme styles' ) }</strong>
									</li>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										<strong>{ translate( 'Change fonts, colors, and more sitewide' ) }</strong>
									</li>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										{ translate( 'Unlimited customer support via email' ) }
									</li>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										{ translate( 'Remove WordPress.com Ads' ) }
									</li>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										{ translate( 'Collect payments' ) }
									</li>
									<li className="upgrade-modal__included-item">
										<Gridicon icon="checkmark" size={ 16 } />
										{ translate( 'Best-in-class hosting' ) }
									</li>
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
