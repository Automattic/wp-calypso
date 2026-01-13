import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
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
	const translate = useTranslate();

	const { data: { balance: creditBalance = '0.00', history: creditsHistory = [] } = {} } =
		useCreditBalanceQuery();

	const getExpirationText = (
		history: Array< { amount: number; expires: string } >,
		shortVersion: boolean
	) => {
		if ( ! history || history.length === 0 ) {
			return '';
		}

		const sortedHistory = [ ...history ].sort( ( a, b ) =>
			moment( a.expires ).diff( moment( b.expires ) )
		);

		const firstItem = sortedHistory[ 0 ];
		const firstDate = moment( firstItem.expires ).format( shortVersion ? 'L' : 'LL' );

		// Si solo hay 1 item, no hay versión corta diferente
		if ( sortedHistory.length === 1 ) {
			if ( shortVersion ) {
				return translate( 'Expire on %(date)s', {
					args: { date: firstDate },
				} );
			}
			return translate( 'Your credits will expire on %(date)s', {
				args: { date: firstDate },
			} );
		}

		const firstAmount = '$' + formatNumber( firstItem.amount / 100, { decimals: 2 } );
		const lastItem = sortedHistory[ sortedHistory.length - 1 ];
		const lastDate = moment( lastItem.expires ).format( 'LL' );

		if ( shortVersion ) {
			return translate( 'You have credits expiring on %(firstDate)s and %(lastDate)s.', {
				args: { firstDate, lastDate },
			} );
		}

		return (
			<>
				{ translate( 'You have %(amount)s in credits expiring on %(firstDate)s.', {
					args: { amount: firstAmount, firstDate },
				} ) }
				<br />
				{ translate( 'Your remaining credits will expire on %(lastDate)s', {
					args: { lastDate },
				} ) }
			</>
		);
	};

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

	const creditExpiresSoon = creditsHistory?.some( ( { expires } ) => {
		const exp = moment( expires );
		return (
			exp.isValid() &&
			exp.isAfter( moment(), 'day' ) &&
			exp.isSameOrBefore( moment().add( 1, 'month' ), 'day' )
		);
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
						{ creditExpiresSoon && (
							<div className="blaze-credits-container__credits-notice">
								{ getExpirationText( creditsHistory, false ) }
							</div>
						) }
					</div>
				) }
			</NavTabs>
			{ parseFloat( creditBalance ) > 0 && (
				<div className="blaze-credits-container blaze-credits-mobile-only">
					<div className="blaze-credits-container__label">
						<CreditBalanceContent formattedBalance={ mobileFormattedBalance } />
					</div>
					{ creditExpiresSoon && (
						<div className="blaze-credits-container__credits-notice">
							{ getExpirationText( creditsHistory, true ) }
						</div>
					) }
				</div>
			) }
		</SectionNav>
	);
}
