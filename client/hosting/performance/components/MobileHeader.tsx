import { Gridicon, ScreenReaderText } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { ReactNode, useState } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';

type MobileHeaderProps = {
	pageTitle: string;
	pageSelector: JSX.Element;
	subtitle?: ReactNode;
};

export const MobileHeader = ( { pageTitle, pageSelector, subtitle }: MobileHeaderProps ) => {
	const [ isPageSelectorVisible, setIsPageSelectorVisible ] = useState( false );

	const togglePageSelector = () => {
		setIsPageSelectorVisible( ! isPageSelectorVisible );
	};

	return (
		<>
			<NavigationHeader
				className="site-performance__navigation-header"
				title={ <div className="navigation-header-title">{ translate( 'Performance' ) }</div> }
				subtitle={ pageTitle }
			>
				<Button
					variant="tertiary"
					onClick={ togglePageSelector }
					aria-expanded={ isPageSelectorVisible }
				>
					<ScreenReaderText>{ translate( 'toggle page selector' ) }</ScreenReaderText>
					<Gridicon icon="cog" />
				</Button>
			</NavigationHeader>

			{ isPageSelectorVisible && (
				<div
					css={ {
						width: '100%',
					} }
				>
					{ pageSelector }
					<div
						css={ {
							marginTop: '20px',
							fontSize: '14px',
							color: 'var(--color-neutral-50)',
						} }
					>
						{ subtitle }
					</div>
				</div>
			) }
		</>
	);
};
