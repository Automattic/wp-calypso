import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import './upgrade-modal.scss';

interface PremiumGlobalStylesUpgradeModalProps {
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	pickDesign: () => void;
}

export default function PremiumGlobalStylesUpgradeModal( {
	checkout,
	closeModal,
	isOpen,
	pickDesign,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'value_bundle' )
	);

	//Wait until we have product data to show content
	const isLoading = ! premiumPlanProduct;

	const planName = premiumPlanProduct?.product_name;

	return (
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
						<p>
							{ translate(
								'Get access to all theme styles, fonts, colors, and tons of other features by upgrading to {{strong}}%s{{/strong}}.',
								{
									components: {
										strong: <strong />,
									},
									args: planName,
									comment:
										'The variable is the plan name: "...by upgrading to WordPress.com Premium."',
								}
							) }
						</p>
						<div className="upgrade-modal__actions bundle">
							<Button className="upgrade-modal__cancel" onClick={ () => pickDesign() }>
								{ translate( 'Try it out first' ) }
							</Button>
							<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
								{ translate( 'Upgrade plan' ) }
							</Button>
						</div>
					</div>
					<div className="upgrade-modal__col">
						<div className="upgrade-modal__included">
							<h2>{ translate( 'Included with your purchase' ) }</h2>
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
	);
}
