import { Popover } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import { useSelector } from 'calypso/state';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { hasSiteStatsQueryFailed } from 'calypso/state/stats/lists/selectors';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteStatsProps {
	site: SiteExcerptData;
}

const StatsOffIndicatorStyled = styled.div`
	text-align: center;
	border: 1px solid var( --studio-gray-5 );
	border-radius: 4px;
	background-color: var( --studio-gray-5 );
	color: var( --studio-gray-100 );
	font-size: 12px;
	padding: 0 7px;
	display: inline-flex;
`;

const PopoverContent = styled.div`
	font-size: 14px;
	padding: 16px;
	color: var( --color-neutral-50 );
`;

const StatsOffContainer = styled.div`
	text-align: left;
`;

const StatsOffIndicator = () => {
	const [ showPopover, setShowPopover ] = useState( false );
	const tooltipRef = useRef( null );
	const translate = useTranslate();

	const handleOnMouseEnter = () => {
		setShowPopover( true );
	};

	const handleOnMouseExit = () => {
		setShowPopover( false );
	};

	return (
		<StatsOffContainer
			onMouseOver={ handleOnMouseEnter }
			onMouseOut={ handleOnMouseExit }
			onFocus={ handleOnMouseEnter }
			onBlur={ handleOnMouseExit }
		>
			<StatsOffIndicatorStyled className="tooltip-target" ref={ tooltipRef }>
				{ translate( 'Stats off' ) }
			</StatsOffIndicatorStyled>
			<Popover isVisible={ showPopover } context={ tooltipRef.current } css={ { marginTop: -5 } }>
				<PopoverContent>{ translate( 'Stats are disabled on this site.' ) }</PopoverContent>
			</Popover>
		</StatsOffContainer>
	);
};

export const SiteStats = ( { site }: SiteStatsProps ) => {
	const { ref, inView } = useInView( { triggerOnce: true } );
	const hasStatsLoadingError = useSelector( ( state ) => {
		const siteId = site.ID;
		const query = {};
		const statType = 'statsInsights';
		return siteId && hasSiteStatsQueryFailed( state, siteId, statType, query );
	} );

	const { isWPAdmin: isClassicView, adminUrl } = useSiteAdminInterfaceData( site.ID );
	const statsUrl = isClassicView
		? `${ adminUrl }admin.php?page=stats`
		: `/stats/day/${ site.slug }`;

	return (
		<div ref={ ref }>
			{ inView && (
				<>
					{ hasStatsLoadingError || site.is_deleted ? (
						<StatsOffIndicator />
					) : (
						<a href={ statsUrl }>
							<StatsSparkline siteId={ site.ID } showLoader />
						</a>
					) }
				</>
			) }
		</div>
	);
};
