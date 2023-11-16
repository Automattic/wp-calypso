import { Button, Gridicon, PremiumBadge } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import useGlobalStylesUpgradeTranslations from 'calypso/components/premium-global-styles-upgrade-modal/use-global-styles-upgrade-translations';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-upsell.scss';

interface Props {
	numOfSelectedGlobalStyles?: number;
	onCheckout: () => void;
	onTryStyle: () => void;
}

const ScreenUpsell = ( { numOfSelectedGlobalStyles = 1, onCheckout, onTryStyle }: Props ) => {
	const translate = useTranslate();
	const { title, description } = useScreen( 'upsell' );
	const translations = useGlobalStylesUpgradeTranslations( { numOfSelectedGlobalStyles } );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<div className="screen-container__body">
				<strong className="screen-upsell__heading">
					{ translate( 'Premium styles' ) }
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={ translate( 'Upgrade' ) }
					/>
				</strong>
				<div className="screen-upsell__description">
					<p>{ translations.description }</p>
				</div>
				<strong>{ translations.featuresTitle }</strong>
				<ul className="screen-upsell__features">
					{ translations.features.map( ( feature, i ) => (
						<li key={ i }>
							<Gridicon icon="checkmark" size={ 16 } />
							{ feature }
						</li>
					) ) }
				</ul>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" onClick={ onTryStyle }>
					{ translations.cancel }
				</Button>
				<Button className="pattern-assembler__button" primary onClick={ onCheckout }>
					{ translations.upgradeWithPlan }
				</Button>
			</div>
		</>
	);
};

export default ScreenUpsell;
