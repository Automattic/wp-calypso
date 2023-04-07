import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { header, footer, layout, color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';

interface Props {
	shouldUnlockGlobalStyles: boolean;
	isDismissedGlobalStylesUpgradeModal?: boolean;
	onSelect: ( name: string ) => void;
	onContinueClick: () => void;
}

const ScreenMain = ( {
	shouldUnlockGlobalStyles,
	isDismissedGlobalStylesUpgradeModal,
	onSelect,
	onContinueClick,
}: Props ) => {
	const translate = useTranslate();
	const getDescription = () => {
		if ( ! shouldUnlockGlobalStyles ) {
			return translate( 'Ready? Go to the Site Editor to edit your content.' );
		}

		if ( isDismissedGlobalStylesUpgradeModal ) {
			return translate(
				'Ready? Keep your styles and go to the Site Editor to edit your content. You’ll be able to upgrade to the Premium plan later.'
			);
		}

		return translate( "You've selected a premium color or font for your site." );
	};

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Let’s get creative' ) }
				description={ translate(
					'Use our library of styles and patterns to design your own homepage.'
				) }
				hideBack
			/>
			<div className="screen-container__body screen-container__body--align-sides">
				<ItemGroup>
					<NavigationButtonAsItem
						path="/header"
						icon={ header }
						aria-label={ translate( 'Header' ) }
						onClick={ () => onSelect( 'header' ) }
					>
						<span className="pattern-layout__list-item-text">{ translate( 'Header' ) }</span>
					</NavigationButtonAsItem>
					<NavigationButtonAsItem
						path="/section"
						icon={ layout }
						aria-label={ translate( 'Sections' ) }
						onClick={ () => onSelect( 'section' ) }
					>
						<span className="pattern-layout__list-item-text">{ translate( 'Sections' ) }</span>
					</NavigationButtonAsItem>
					<NavigationButtonAsItem
						path="/footer"
						icon={ footer }
						aria-label={ translate( 'Footer' ) }
						onClick={ () => onSelect( 'footer' ) }
					>
						<span className="pattern-layout__list-item-text">{ translate( 'Footer' ) }</span>
					</NavigationButtonAsItem>
					{ isEnabled( 'pattern-assembler/color-and-fonts' ) && (
						<>
							<NavigationButtonAsItem
								path="/color-palettes"
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								onClick={ () => onSelect( 'color-palettes' ) }
							>
								<span className="pattern-layout__list-item-text">{ translate( 'Colors' ) }</span>
							</NavigationButtonAsItem>
							<NavigationButtonAsItem
								path="/font-pairings"
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onSelect( 'font-pairings' ) }
							>
								<span className="pattern-layout__list-item-text">{ translate( 'Fonts' ) }</span>
							</NavigationButtonAsItem>
						</>
					) }
				</ItemGroup>
			</div>
			<div className="screen-container__footer">
				<span className="screen-container__description">{ getDescription() }</span>
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ shouldUnlockGlobalStyles && ! isDismissedGlobalStylesUpgradeModal
						? translate( 'Unlock this style' )
						: translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
