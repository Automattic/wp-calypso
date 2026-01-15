import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import { TabOption, TabType } from 'calypso/my-sites/promote-post-i2/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../../utils';

type Props = {
	tabs: TabOption[];
	selectedTab: TabType;
};

function CreditBalanceContent( { formattedBalance }: { formattedBalance: string } ) {
	const translate = useTranslate();

	return (
		<>
			{ translate( 'Credits: ' ) }
			{ formattedBalance }
			<InlineSupportLink
				showIcon
				className="credits-inline-support-link"
				iconSize={ 16 }
				showText={ false }
				supportPostId={ 240330 }
				supportLink={ localizeUrl( 'https://wordpress.com/support/promote-a-post/blaze-credits/' ) }
			/>
		</>
	);
}

export default function PromotePostTabBar( { tabs, selectedTab }: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const { data: creditBalance = '0.00' } = useCreditBalanceQuery();

	// Smooth horizontal scrolling on mobile views
	const tabsRef = useRef< { [ key: string ]: HTMLSpanElement | null } >( {} );
	const onTabClick = ( key: string ) => {
		tabsRef.current[ key ]?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	};
	const selectedLabel = tabs.find( ( tab ) => tab.id === selectedTab )?.name;
	const formattedBalance = '$' + formatNumber( parseFloat( creditBalance ), { decimals: 2 } );
	const mobileFormattedBalance = '$' + formatNumber( parseFloat( creditBalance ), { decimals: 0 } );

	return (
		<SectionNav selectedText={ selectedLabel }>
			<NavTabs>
				{ tabs
					.filter( ( { enabled = true } ) => enabled )
					.map( ( { id, name, itemCount, isCountAmount, className, label = '' } ) => {
						return (
							<NavItem
								key={ id }
								path={ getAdvertisingDashboardPath( `/${ id }/${ selectedSiteSlug }` ) }
								selected={ selectedTab === id }
								className={ className }
								onClick={ () => onTabClick( id ) }
							>
								<span ref={ ( el ) => ( tabsRef.current[ id ] = el ) }>{ name }</span>
								{ itemCount && itemCount !== 0 ? (
									<span className="count">
										{ isCountAmount ? '$' : null }
										{ formatNumber( itemCount, { decimals: isCountAmount ? 2 : 0 } ) }
										<span className="sr-only">{ label }</span>
									</span>
								) : null }
							</NavItem>
						);
					} ) }

				{ parseFloat( creditBalance ) > 0 && (
					<div className="blaze-credits-container blaze-credits-desktop-only">
						<div className="blaze-credits-container__label">
							<CreditBalanceContent formattedBalance={ formattedBalance } />
						</div>
					</div>
				) }
			</NavTabs>
			{ parseFloat( creditBalance ) > 0 && (
				<div className="blaze-credits-container blaze-credits-mobile-only">
					<div className="blaze-credits-container__label">
						<CreditBalanceContent formattedBalance={ mobileFormattedBalance } />
					</div>
				</div>
			) }
		</SectionNav>
	);
}
