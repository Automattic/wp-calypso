import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { header, footer, layout, color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';

interface Props {
	shouldUnlockGlobalStyles: boolean;
	onSelect: ( name: string ) => void;
	onContinueClick: () => void;
}

const ScreenMain = ( { shouldUnlockGlobalStyles, onSelect, onContinueClick }: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Let’s get creative' ) }
				description={ translate(
					'Use our library of styles and patterns to design your own homepage.'
				) }
				hideBack
			/>
			<div className="screen-container__body">
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
						path="/footer"
						icon={ footer }
						aria-label={ translate( 'Footer' ) }
						onClick={ () => onSelect( 'footer' ) }
					>
						<span className="pattern-layout__list-item-text">{ translate( 'Footer' ) }</span>
					</NavigationButtonAsItem>
					<NavigationButtonAsItem
						path="/homepage"
						icon={ layout }
						aria-label={ translate( 'Homepage' ) }
						onClick={ () => onSelect( 'homepage' ) }
					>
						<span className="pattern-layout__list-item-text">{ translate( 'Homepage' ) }</span>
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
				<span className="screen-container__description">
					{ shouldUnlockGlobalStyles
						? translate( 'You’ve selected Premium fonts or colors for your site.' )
						: translate( 'Ready? Go to the Site Editor to edit your content.' ) }
				</span>
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ shouldUnlockGlobalStyles ? translate( 'Unlock this style' ) : translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
