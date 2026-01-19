import { Popover } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import { TabOption, TabType } from 'calypso/my-sites/promote-post-i2/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	getAdvertisingDashboardPath,
	getCreditExpirationInfo,
	getCreditExpirationLines,
} from '../../utils';

type Props = {
	tabs: TabOption[];
	selectedTab: TabType;
};

function CreditBalanceContent( { formattedBalance }: { formattedBalance: string } ) {
	const translate = useTranslate();
	const { data: { history: creditsHistory = [] } = {} } = useCreditBalanceQuery();
	const anchorRef = useRef< HTMLSpanElement >( null );
	const [ isVisible, setIsVisible ] = useState( false );

	// Get all credits sorted by expiration (not just those expiring soon)
	const { sortedHistory } = useMemo(
		() => getCreditExpirationInfo( creditsHistory ),
		[ creditsHistory ]
	);

	const expirationLines = useMemo(
		() => getCreditExpirationLines( sortedHistory, translate ),
		[ sortedHistory, translate ]
	);

	return (
		<>
			{ translate( 'Credits: ' ) }
			{ formattedBalance }
			<span
				ref={ anchorRef }
				onMouseEnter={ () => setIsVisible( true ) }
				onMouseLeave={ () => setIsVisible( false ) }
				style={ { display: 'inline-block', lineHeight: 0 } }
			>
				<InlineSupportLink
					showIcon
					className="credits-inline-support-link"
					iconSize={ 16 }
					showText={ false }
					supportPostId={ 240330 }
					supportLink={ localizeUrl(
						'https://wordpress.com/support/promote-a-post/blaze-credits/'
					) }
				/>
			</span>
			{ isVisible && expirationLines && anchorRef.current && (
				<Popover
					context={ anchorRef.current }
					isVisible
					position="right"
					onClose={ () => setIsVisible( false ) }
				>
					<div style={ { padding: '8px 12px', maxWidth: '250px', textAlign: 'left' } }>
						{ expirationLines.map( ( line: string, index: number ) => (
							<div key={ index }>{ line }</div>
						) ) }
					</div>
				</Popover>
			) }
		</>
	);
}

export default function PromotePostTabBar( { tabs, selectedTab }: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const { data: { balance: creditBalance = '0.00' } = {} } = useCreditBalanceQuery();

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
	const formattedBalance = formatCurrency( parseFloat( creditBalance ), 'USD' );
	const mobileFormattedBalance = formatCurrency( parseFloat( creditBalance ), 'USD', {
		stripZeros: true,
	} );

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
